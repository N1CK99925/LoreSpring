from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from src.schemas.revision import RevisionResult
from langchain_core.messages import HumanMessage, SystemMessage
from json_repair import repair_json
import json


def revision_agent_node(state: NarrativeState) -> NarrativeState:
    metadata = state.get('metadata', {})
    genre = metadata.get('genre', 'fantasy')
    draft_current = state.get('draft')
    revision_count = state.get('revision_count', 0)
    chapter_number = state.get("chapter_number")
    user_direction = state.get('user_direction')

    if not draft_current:
        return state

    system = """
    You are a strict literary editor.
    Your job:
    - Evaluate quality numerically.
    - Identify weaknesses precisely.
    - Do NOT rewrite the chapter.
    - Do NOT add new story content.
    - Be concise and critical.
    - Be conservative in scoring (most drafts fall between 5-7).
    """

    user = f"""
    CHAPTER NUMBER: {chapter_number}
    GENRE: {genre}

    USER DIRECTION:
    {user_direction}

    REVISION COUNT: {revision_count}

    --- CHAPTER DRAFT START ---
    {draft_current}
    --- CHAPTER DRAFT END ---

    Evaluate using these dimensions (0-10 scale):
    - pacing
    - character_depth
    - prose_clarity
    - tension
    - prompt_adherence

    Scoring rules:
    0-3  = weak / broken
    4-6  = average / flawed
    7-8  = strong
    9-10 = exceptional

    Provide exactly 3 feedback bullet points identifying the most critical weaknesses.
    """

    metrics_dict = {}
    quality_feedback = []

    # --- ATTEMPT 1: standard with_structured_output ---
    try:
        llm = get_llm(select_model("analysis"), temp=0.2, max_tokens=1000)
        structured_llm = llm.with_structured_output(RevisionResult)
        result: RevisionResult = structured_llm.invoke(
            [SystemMessage(content=system), HumanMessage(content=user)]
        )

        metrics_dict = result.quality_metrics.model_dump()
        quality_feedback = result.quality_feedback
        print("revision node: attempt 1 succeeded")

    except Exception as e1:
        print(f"revision node attempt 1 failed: {e1}, trying fallback...")

        # --- ATTEMPT 2: json_mode + double prompt + json_repair + manual pydantic validation ---
        double_prompt_user = f"""
        CHAPTER NUMBER: {chapter_number}
        GENRE: {genre}

        USER DIRECTION:
        {user_direction}

        REVISION COUNT: {revision_count}

        --- CHAPTER DRAFT START ---
        {draft_current}
        --- CHAPTER DRAFT END ---

        Step 1: Carefully read the draft and think through each quality dimension:
        - pacing: does the scene move at the right speed? does it drag or rush?
        - character_depth: are characters psychologically complex or flat?
        - prose_clarity: is the writing clear or muddled? any clichés or redundancy?
        - tension: is there genuine dramatic tension? does it build?
        - prompt_adherence: does the draft follow the user direction faithfully?

        Score each 0-10. Be conservative — most drafts score 5-7.
        Identify the 3 most critical weaknesses as separate short sentences.

        Step 2: Format your evaluation as a JSON object with exactly this structure:
        {{
            "quality_metrics": {{
                "pacing": <int 0-10>,
                "character_depth": <int 0-10>,
                "prose_clarity": <int 0-10>,
                "tension": <int 0-10>,
                "prompt_adherence": <int 0-10>
            }},
            "quality_feedback": [
                "first weakness as a short sentence",
                "second weakness as a short sentence",
                "third weakness as a short sentence"
            ]
        }}

        RULES:
        - quality_feedback MUST be a list of exactly 3 separate strings, one per item
        - Do NOT combine all feedback into a single string
        - Return only the JSON object, no extra text
        """

        try:
            llm_raw = get_llm(select_model("analysis"), temp=0.2, max_tokens=1000)
            raw_response = llm_raw.invoke(
                [
                    SystemMessage(content="You are a JSON-only literary evaluation engine. Return only valid JSON."),
                    HumanMessage(content=double_prompt_user)
                ]
            )

            repaired = repair_json(raw_response.content)
            parsed = json.loads(repaired)

            
            result = RevisionResult(**parsed)
            metrics_dict = result.quality_metrics.model_dump()
            quality_feedback = result.quality_feedback
            print("revision node: attempt 2 succeeded")

        except Exception as e2:
            print(f"revision node attempt 2 failed: {e2}, using defaults")
            state["quality_metrics"] = {}
            state["quality_feedback"] = []
            state["quality_score"] = 0.0
            state["should_revise"] = True
            return state

    
    state["quality_metrics"] = metrics_dict
    state["quality_feedback"] = quality_feedback

    print(quality_feedback)

    avg_score = sum(metrics_dict.values()) / len(metrics_dict) if metrics_dict else 0.0
    state["quality_score"] = avg_score

    max_revisions = state.get("max_revisions", 2)
    threshold = state.get("quality_threshold", 6.5)

    state["should_revise"] = (
        state.get("should_revise", False) or
        (avg_score < threshold and revision_count < max_revisions)
    )

    print(avg_score)
    print("revision node working\n")

    return state