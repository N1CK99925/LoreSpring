from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from src.schemas.continuity import ContinuityResult
from langchain_core.messages import HumanMessage, SystemMessage


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

    llm = get_llm(select_model("analysis"), temp=0.1, max_tokens=1200)
    structured_llm = llm.with_structured_output(ContinuityResult)

    print("continuity node running")

    try:
        result: ContinuityResult = structured_llm.invoke(
            [SystemMessage(content=system), HumanMessage(content=human)]
        )
        issues = [i.model_dump() for i in result.continuity_issues]
    except Exception as e:
        print(f"Continuity node failed: {e}, defaulting to no issues")
        issues = []

    critical = [i for i in issues if i.get("severity") == "high"]

    state["continuity_issues"] = issues
    state["continuity_feedback"] = critical
    state["should_revise"] = state.get("should_revise", False) or len(critical) > 0

    print("continuity issues:", issues)
    print("force revise:", state["should_revise"])

    return state