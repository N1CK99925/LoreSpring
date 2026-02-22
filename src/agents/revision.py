from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from src.schemas.revision import RevisionResult
from langchain_core.messages import HumanMessage, SystemMessage


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

    llm = get_llm(select_model("analysis"), temp=0.2, max_tokens=1000)
    structured_llm = llm.with_structured_output(RevisionResult)

    messages = [SystemMessage(content=system), HumanMessage(content=user)]

    try:
        result: RevisionResult = structured_llm.invoke(messages)
        
       
        metrics = result.quality_metrics
        metrics_dict = metrics.model_dump()

        state["quality_metrics"] = metrics_dict
        state["quality_feedback"] = result.quality_feedback
        
        print(state.get('quality_feedback'))

        avg_score = sum(metrics_dict.values()) / len(metrics_dict)
        state["quality_score"] = avg_score

        max_revisions = state.get("max_revisions", 2)
        threshold = state.get("quality_threshold", 6.5)

        state["should_revise"] = (
            state.get("should_revise", False) or
            (avg_score < threshold and revision_count < max_revisions)
        )

        print(avg_score)
        print("revision node working\n")

    except Exception as e:
        print(f"Revision agent failed: {e}, using defaults")
        state["quality_metrics"] = {}
        state["quality_feedback"] = []
        state["quality_score"] = 0.0
        state["should_revise"] = True
    
    return state