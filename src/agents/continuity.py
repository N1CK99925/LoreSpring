from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from src.schemas.continuity import ContinuityResult
from langchain_core.messages import HumanMessage, SystemMessage
from json_repair import repair_json
import json


def continue_agent_node(state: NarrativeState) -> NarrativeState:
    draft = state.get("draft")
    previous_chapter_summary = state.get('previous_chapter_summary', [])
    lore_context = state.get("lore_context", {})

    system = """
    You are a narrative continuity validation engine.

    Your task:
    - Compare the CURRENT DRAFT against the ESTABLISHED STORY MEMORY.
    - Detect factual contradictions.
    - Detect character inconsistencies.
    - Detect timeline conflicts.
    - Detect object/item continuity errors.
    - Detect location logic violations.
    - Detect ONLY DIRECT contradictions.

    Important rules:
    - Do NOT rewrite the story.
    - Do NOT evaluate prose quality.
    - Do NOT suggest improvements.
    - Only report factual or logical continuity issues.

    CRITICAL RULES:
    - Missing details are NOT contradictions.
    - New information is allowed unless it directly conflicts with established facts.
    - A scene evolving or expanding is NOT a contradiction.
    - Only flag issues when BOTH statements cannot be true simultaneously.

    Severity rules:
    HIGH:   Impossible timeline / Dead character alive / Object changes identity
    MEDIUM: Strong logical conflict
    LOW:    Possible interpretation differences

    If no issues found, return an empty continuity_issues list.
    """

    human = f"""
    ESTABLISHED STORY MEMORY:
    {previous_chapter_summary}

    CURRENT LORE CONTEXT:
    {lore_context}

    CURRENT DRAFT:
    {draft}

    Analyze the draft against the established memory.
    Only flag issues where TWO STATEMENTS directly cannot both be true.
    """

    issues = []

    
    try:
        llm = get_llm(select_model("analysis"), temp=0.0, max_tokens=1200)
        structured_llm = llm.with_structured_output(ContinuityResult)
        result: ContinuityResult = structured_llm.invoke(
            [SystemMessage(content=system), HumanMessage(content=human)]
        )
        issues = [i.model_dump() for i in result.continuity_issues]
        print("continuity node: attempt 1 succeeded")

    except Exception as e1:
        print(f"continuity node attempt 1 failed: {e1}, trying fallback...")

        
        double_prompt_human = f"""
        ESTABLISHED STORY MEMORY:
        {previous_chapter_summary}

        CURRENT LORE CONTEXT:
        {lore_context}

        CURRENT DRAFT:
        {draft}

        Step 1: Carefully think through the established memory vs the current draft.
        For each potential issue ask yourself: can BOTH statements be true simultaneously?
        - If yes -> NOT a contradiction, skip it.
        - If no  -> flag it.
        Consider: character facts, timeline, objects, locations. Ignore prose quality entirely.

        Step 2: Format your findings as a JSON object with exactly this structure:
        {{
            "continuity_issues": [
                {{
                    "type": "contradiction" | "character" | "timeline" | "object" | "location",
                    "description": "short string describing the direct conflict between two statements",
                    "severity": "high" | "medium" | "low"
                }}
            ]
        }}

        RULES:
        - If no real contradictions exist, return {{"continuity_issues": []}}
        - Each issue must describe TWO conflicting statements, not just quote the draft
        - Do NOT flag new information, style choices, or missing details
        - Return only the JSON object, no extra text
        """

        try:
            llm_raw = get_llm(select_model("analysis"), temp=0.0, max_tokens=1200)
            raw_response = llm_raw.invoke(
                [
                    SystemMessage(content="You are a JSON-only continuity validation engine. Return only valid JSON."),
                    HumanMessage(content=double_prompt_human)
                ]
            )

            repaired = repair_json(raw_response.content)
            parsed = json.loads(repaired)

           
            result = ContinuityResult(**parsed)
            issues = [i.model_dump() for i in result.continuity_issues]
            print("continuity node: attempt 2 succeeded")

        except Exception as e2:
            print(f"continuity node attempt 2 failed: {e2}, defaulting to no issues")
            issues = []

    critical = [i for i in issues if i.get("severity", "") == "high"]

    state["continuity_issues"] = issues
    state["continuity_feedback"] = critical
    state["should_revise"] = len(critical) > 0

    print("continuity issues:", issues)
    print("force revise:", state["should_revise"])

    return state