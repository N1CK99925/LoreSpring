from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from src.schemas.revision import RevisionResult
from langchain_core.messages import HumanMessage, SystemMessage
from src.memory.lightrag import query_lore
from json_repair import repair_json
import json

from langsmith import traceable


@traceable(name="revision")
async def revision_agent_node(state: NarrativeState) -> NarrativeState:
    metadata = state.get("metadata", {})
    genre = metadata.get("genre", "fantasy")
    draft_current = state.get("draft")
    revision_count = state.get("revision_count", 0)
    chapter_number = state.get("chapter_number")
    user_direction = state.get("user_direction", "")

    if not draft_current:
        return state

    lore_context = await query_lore(
        f"Relevant lore for Chapter {chapter_number}, user direction: {user_direction}",
        mode="hybrid"
    )

   

    system = """You are a senior literary editor specializing in fiction quality assessment.

        Your sole function is to evaluate the quality of a chapter draft and identify its weaknesses.

        EVALUATION DIMENSIONS (score each 0–10):
        - pacing: Does the scene move at the right speed? Does it drag or rush?
        - character_depth: Are characters psychologically complex, or flat and predictable?
        - prose_clarity: Is the writing clear and precise, or muddled with clichés and redundancy?
        - tension: Is there genuine dramatic tension? Does it build or fall flat?
        - prompt_adherence: Does the draft faithfully follow the user direction?

        SCORING GUIDE:
        0–3  = weak or broken
        4–6  = average with notable flaws
        7–8  = strong, minor issues
        9–10 = exceptional, publish-ready

        SCORING RULES:
        - Be conservative. Most drafts score between 5 and 7.
        - Score based on what is written, not what could be.
        - Do not rewrite the chapter.
        - Do not add new story content.
        - Do not give general praise — identify specific weaknesses only.

        FEEDBACK RULES:
        - Provide exactly 3 feedback items.
        - Each item must be a separate, concise sentence describing one specific weakness.
        - Focus on the most critical flaws only."""

    human = f"""<context>
        Chapter: {chapter_number}
        Genre: {genre}
        Revision count: {revision_count}

        User direction:
        {user_direction}

        Relevant lore:
        {lore_context}
        </context>

        <chapter_draft>
        {draft_current}
        </chapter_draft>

        Evaluate the chapter draft against all five dimensions. Apply the scoring guide conservatively. Return your quality_metrics scores and exactly 3 quality_feedback items identifying the most critical weaknesses."""

    metrics_dict = {}
    quality_feedback = []

    try:
        llm = get_llm(select_model("analysis"), temp=0.2, max_tokens=1000)
        structured_llm = llm.with_structured_output(RevisionResult)
        result: RevisionResult = structured_llm.invoke(
            [SystemMessage(content=system), HumanMessage(content=human)]
        )

        metrics_dict = result.quality_metrics.model_dump()
        quality_feedback = result.quality_feedback
        print("revision node: attempt 1 succeeded")

    except Exception as e1:
        print(f"revision node attempt 1 failed: {e1}, trying fallback...")

       

        system_fallback = (
            "You are a JSON-only literary evaluation engine. "
            "Return only valid JSON. No markdown fences. No explanation. No commentary."
        )

        fallback_prompt = f"""You are a senior literary editor. Evaluate the chapter draft below across five quality dimensions and return a structured JSON assessment.

        <context>
        Chapter: {chapter_number}
        Genre: {genre}
        Revision count: {revision_count}

        User direction:
        {user_direction}

        Relevant lore:
        {lore_context}
        </context>

        <chapter_draft>
        {draft_current}
        </chapter_draft>

        <evaluation_criteria>
        Score each dimension from 0 to 10:
        - pacing: Does the scene move at the right speed? Does it drag or rush?
        - character_depth: Are characters psychologically complex, or flat and predictable?
        - prose_clarity: Is the writing clear and precise, or muddled with clichés and redundancy?
        - tension: Is there genuine dramatic tension? Does it build?
        - prompt_adherence: Does the draft faithfully follow the user direction?

        Scoring guide:
        0-3  = weak or broken
        4-6  = average with notable flaws
        7-8  = strong, minor issues
        9-10 = exceptional

        Be conservative — most drafts score between 5 and 7.
        </evaluation_criteria>

        <output_schema>
        {{
        "quality_metrics": {{
            "pacing": <integer 0-10>,
            "character_depth": <integer 0-10>,
            "prose_clarity": <integer 0-10>,
            "tension": <integer 0-10>,
            "prompt_adherence": <integer 0-10>
        }},
        "quality_feedback": [
            "First weakness as a single concise sentence.",
            "Second weakness as a single concise sentence.",
            "Third weakness as a single concise sentence."
        ]
        }}
        </output_schema>

        <examples>
        Example 1 — a draft with clear flaws:
        {{
        "quality_metrics": {{
            "pacing": 5,
            "character_depth": 4,
            "prose_clarity": 6,
            "tension": 4,
            "prompt_adherence": 7
        }},
        "quality_feedback": [
            "The opening scene lingers too long on environmental description before the conflict is introduced.",
            "The antagonist reacts to events without any visible internal motivation, making them feel like a plot device.",
            "Tension dissolves after the confrontation scene because consequences are resolved too quickly."
        ]
        }}

        Example 2 — a stronger draft:
        {{
        "quality_metrics": {{
            "pacing": 7,
            "character_depth": 8,
            "prose_clarity": 7,
            "tension": 6,
            "prompt_adherence": 8
        }},
        "quality_feedback": [
            "The middle section stalls when two characters recap events the reader already witnessed.",
            "Prose occasionally slips into passive voice during action beats, reducing urgency.",
            "The chapter ending resolves the immediate conflict but does not plant a strong enough hook."
        ]
        }}
        </examples>

        Evaluate the chapter. Return only the JSON object. No markdown. No extra text."""

        try:
            llm_raw = get_llm(select_model("analysis"), temp=0.2, max_tokens=1000)
            raw_response = llm_raw.invoke(
                [
                    SystemMessage(content=system_fallback),
                    HumanMessage(content=fallback_prompt)
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