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
        """Retrieve all canonical established facts relevant to:
        - Characters appearing in this draft (traits, status, relationships)
        - Timeline of major events so far
        - Known object states and ownership
        - Location rules or constraints
        - Any previously resolved conflicts

        Return factual memory only. No commentary.""",
        mode="hybrid"
    )

   

    system = """You are a narrative continuity validation engine for long-form fiction.

        Your sole function is to detect direct logical contradictions between an established canonical record and a new draft chapter. You do not assess prose quality, suggest edits, or fill in missing details.

        WHAT TO FLAG:
        - A fact in the draft that cannot simultaneously be true with a canonical fact
        - A character acting in a way that contradicts their established traits or status (e.g., dead character appearing alive)
        - A timeline event that is out of sequence or impossible given prior events
        - An object changing identity, ownership, or state in a way that conflicts with established canon
        - A location used in a way that violates previously established rules or geography

        WHAT NOT TO FLAG:
        - Missing details or gaps (omission is not contradiction)
        - New information that does not conflict with existing canon
        - Interpretive ambiguity where both readings could coexist

        SEVERITY SCALE:
        - high: Logically impossible (dead character alive, timeline rupture, object identity change)
        - medium: Strong logical conflict requiring one statement to be false
        - low: Interpretive inconsistency where coexistence is unlikely but not impossible

        If no contradictions exist, return an empty continuity_issues list."""

    human = f"""<established_summary>
        {prev_summary_text}
        </established_summary>

        <canonical_lore>
        {continuity_lore}
        </canonical_lore>

        <current_draft>
        {draft}
        </current_draft>

        For each potential issue, ask yourself: "Can BOTH statements be simultaneously true?" If yes, do not flag it. Only flag direct contradictions."""

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

      

        system_fallback = (
            "You are a JSON-only output machine. "
            "Return valid JSON. No markdown fences. No explanation. No commentary."
        )

        fallback_prompt = f"""You are a narrative continuity validator. Your job is to find direct logical contradictions between the canonical record and a new draft chapter.

        A contradiction exists ONLY when two statements cannot both be true at the same time.
        Missing detail is NOT a contradiction. New information is NOT a contradiction.

        <established_summary>
        {prev_summary_text}
        </established_summary>

        <canonical_lore>
        {continuity_lore}
        </canonical_lore>

        <current_draft>
        {draft}
        </current_draft>

        <output_schema>
        {{
        "continuity_issues": [
            {{
            "type": "contradiction" or "character" or "timeline" or "object" or "location",
            "description": "one sentence stating what the canon says vs. what the draft says",
            "severity": "high" or "medium" or "low"
            }}
        ]
        }}
        </output_schema>

        <examples>
        Example 1 — contradiction found:
        Canon says Lord Varen died in Chapter 3. Draft shows Lord Varen speaking dialogue in Chapter 7.
        Output:
        {{
        "continuity_issues": [
            {{
            "type": "character",
            "description": "Canon establishes Lord Varen died in Chapter 3, but the draft depicts him speaking in Chapter 7 with no resurrection explanation.",
            "severity": "high"
            }}
        ]
        }}

        Example 2 — no contradictions:
        Output:
        {{
        "continuity_issues": []
        }}
        </examples>

        Now analyze the draft. Return only the JSON object. No markdown. No extra text."""

        try:
            llm_raw = get_llm(select_model("analysis"), temp=0.0, max_tokens=1200)
            raw_response = llm_raw.invoke(
                [
                    SystemMessage(content=system_fallback),
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