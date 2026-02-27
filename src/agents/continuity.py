from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from src.schemas.continuity import ContinuityResult
from src.memory.lightrag import query_lore
from langchain_core.messages import HumanMessage, SystemMessage
from json_repair import repair_json
import json

from langsmith import traceable


@traceable(name="continuity")
async def continue_agent_node(state: NarrativeState) -> NarrativeState:
    draft = state.get("draft", "")

    previous_chapters_summary = state.get("previous_chapter_summary", [])
    prev_summary_text = "\n\n".join([
        f"Chapter {s['chapter_number']}: {s['summary']}"
        for s in previous_chapters_summary
    ]) if previous_chapters_summary else "No prior chapters."


    continuity_lore = await query_lore(
        f"""
        Provide all canonical established facts relevant to:
        - Characters appearing in this draft
        - Timeline of major events so far
        - Known object states and ownership
        - Location rules or constraints
        - Any previously resolved conflicts

        Return factual memory only. No commentary.
        """,
        mode="hybrid"
    )

    system = """
You are a narrative continuity validation engine.

Your task:
- Compare the CURRENT DRAFT against ESTABLISHED CANONICAL MEMORY.
- Detect direct factual contradictions only.
- Detect character inconsistencies.
- Detect timeline conflicts.
- Detect object continuity errors.
- Detect location logic violations.

CRITICAL RULES:
- Missing detail is NOT a contradiction.
- New information is allowed unless it directly conflicts.
- Only flag when BOTH statements cannot be true simultaneously.
- Do NOT evaluate prose quality.
- Do NOT suggest rewrites.

Severity:
HIGH: Impossible timeline / Dead character alive / Object identity change
MEDIUM: Strong logical conflict
LOW: Interpretive inconsistency

If no issues found, return empty continuity_issues list.
"""

    human = f"""
ESTABLISHED STORY SUMMARY:
{prev_summary_text}

CANONICAL LORE:
{continuity_lore}

CURRENT DRAFT:
{draft}

Analyze strictly for direct logical contradictions.
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

        fallback_prompt = f"""
ESTABLISHED STORY SUMMARY:
{prev_summary_text}

CANONICAL LORE:
{continuity_lore}

CURRENT DRAFT:
{draft}

Step 1:
Check each potential issue carefully.
Ask: Can BOTH statements be true simultaneously?
If yes → NOT a contradiction.
If no → Flag it.

Step 2:
Return ONLY this JSON format:

{{
    "continuity_issues": [
        {{
            "type": "contradiction" | "character" | "timeline" | "object" | "location",
            "description": "short description of the direct conflict between two statements",
            "severity": "high" | "medium" | "low"
        }}
    ]
}}

If none exist, return {{"continuity_issues": []}}
No extra text.
"""

        try:
            llm_raw = get_llm(select_model("analysis"), temp=0.0, max_tokens=1200)
            raw_response = llm_raw.invoke(
                [
                    SystemMessage(content="Return valid JSON only."),
                    HumanMessage(content=fallback_prompt)
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

 
    critical = [i for i in issues if i.get("severity") == "high"]

    state["continuity_issues"] = issues
    state["continuity_feedback"] = critical
    state["should_revise"] = len(critical) > 0

    print("continuity issues:", issues)
    print("force revise:", state["should_revise"])

    return state