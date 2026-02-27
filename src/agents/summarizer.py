from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from src.schemas.summarizer import SummarizerResult
from langchain_core.messages import HumanMessage, SystemMessage
from src.memory.lightrag import query_lore
from json_repair import repair_json
import json

from langsmith import traceable


@traceable(name="summarizer")
async def summarizer_agent_node(state: NarrativeState) -> NarrativeState:
    draft = state.get("draft")
    chapter_number = state.get("chapter_number")
    metadata = state.get("metadata", {})
    genre = metadata.get("genre", "fantasy")
    user_direction = state.get("user_direction", "")

    if not draft:
        return state

    lore_context = await query_lore(
        f"Relevant lore for Chapter {chapter_number}, user direction: {user_direction}",
        mode="hybrid"
    )

    system = """You are a structured narrative summarization engine for long-form fiction.

        Your sole function is to extract and compress narrative information from a chapter draft.

        WHAT TO PRODUCE:
        - A single concise summary of 150-250 words covering the chapter's narrative arc
        - A list of 3-6 key plot events in chronological order, each as a short phrase
        - A map of character state changes — only changes that actually occur in the chapter

        RULES:
        - Extract only what is present in the chapter. Do not invent or infer details.
        - Each key event must be a discrete plot beat, not a vague generalization.
        - Character updates must describe a concrete change: knowledge gained, relationship shifted, status altered, decision made.
        - Omit characters who do not meaningfully change in this chapter.
        - Do not evaluate prose quality or suggest improvements."""

    human = f"""<context>
        Chapter: {chapter_number}
        Genre: {genre}

        User direction:
        {user_direction}

        Relevant lore:
        {lore_context}
        </context>

        <chapter_draft>
        {draft}
        </chapter_draft>

        Summarize the chapter. Extract key plot events in order and character state changes. Only include what is directly present in the draft."""

    chapter_summary = f"Chapter {chapter_number} events."
    key_events = []
    character_updates = {}

    try:
        llm = get_llm(select_model("analysis"), temp=0.0, max_tokens=1500)
        structured_llm = llm.with_structured_output(SummarizerResult)
        result: SummarizerResult = structured_llm.invoke(
            [SystemMessage(content=system), HumanMessage(content=human)]
        )
        chapter_summary = result.chapter_summary
        key_events = result.key_events
        character_updates = result.character_updates
        print("summary node: attempt 1 succeeded")

    except Exception as e1:
        print(f"summary node attempt 1 failed: {e1}, trying fallback...")

       

        system_fallback = (
            "You are a JSON-only narrative summarization engine. "
            "Return only valid JSON. No markdown fences. No explanation. No commentary."
        )

        fallback_prompt = f"""You are a narrative summarization engine for long-form fiction. Extract structured information from the chapter draft below.

        <context>
        Chapter: {chapter_number}
        Genre: {genre}

        User direction:
        {user_direction}

        Relevant lore:
        {lore_context}
        </context>

        <chapter_draft>
        {draft}
        </chapter_draft>

        <extraction_rules>
        1. chapter_summary: Write 150–250 words covering the chapter's overall narrative arc. Extract only what is in the chapter — do not invent details.
        2. key_events: List 3–6 discrete plot beats in chronological order. Each must be a short, specific phrase describing one event.
        3. character_updates: For each character who meaningfully changes, write one sentence describing the concrete change (knowledge, status, relationship, or decision). Omit characters with no meaningful change.
        </extraction_rules>

        <output_schema>
        {{
        "chapter_summary": "single string, 150-250 words",
        "key_events": [
            "event 1 as a short phrase",
            "event 2 as a short phrase",
            "event 3 as a short phrase"
        ],
        "character_updates": {{
            "CharacterName": "one sentence describing what concretely changed for them"
        }}
        }}
        </output_schema>

        <examples>
        Example 1:
        {{
        "chapter_summary": "Chapter 4 opens with Mira discovering the forged seal on the treaty document, confirming her suspicion that Lord Aldren has been manipulating the peace negotiations. She confronts her advisor Cael, who admits he knew but feared speaking out. After a tense argument, Mira sends Cael to intercept the courier before the treaty reaches the capital. Meanwhile, Aldren meets in secret with the merchant guild, promising them trade exemptions in exchange for silence. The chapter ends with Mira alone in the war room, burning her draft resignation letter.",
        "key_events": [
            "Mira discovers the forged seal on the treaty",
            "Cael admits he withheld the information",
            "Mira orders Cael to intercept the courier",
            "Aldren bribes the merchant guild for silence",
            "Mira burns her resignation letter"
        ],
        "character_updates": {{
            "Mira": "Shifts from suspicion to certainty about Aldren's betrayal and chooses to fight rather than resign.",
            "Cael": "His complicit silence is exposed, straining his loyalty bond with Mira.",
            "Aldren": "Deepens his conspiracy by securing the merchant guild's silence."
        }}
        }}

        Example 2 — chapter with fewer events:
        {{
        "chapter_summary": "Chapter 7 is a quiet interlude set the morning after the siege. Bren tends to his wounds alone in the barracks, refusing help from the field medic. A brief visit from Commander Yael reveals that the siege was a deliberate trap, not a raid. Bren says nothing but his expression confirms he already suspected. The chapter closes with Bren sharpening his blade in silence as the rest of the camp sleeps.",
        "key_events": [
            "Bren refuses medical aid and isolates himself",
            "Yael reveals the siege was a planned trap",
            "Bren's reaction confirms prior suspicion"
        ],
        "character_updates": {{
            "Bren": "Confirmed his suspicion that the siege was deliberate; retreats further into isolation.",
            "Yael": "Chooses to share classified information with Bren, signaling a shift in trust."
        }}
        }}
        </examples>

        Extract from the chapter draft above. Return only the JSON object. No markdown. No extra text."""

        try:
            llm_raw = get_llm(select_model("analysis"), temp=0.0, max_tokens=1500)
            raw_response = llm_raw.invoke(
                [
                    SystemMessage(content=system_fallback),
                    HumanMessage(content=fallback_prompt)
                ]
            )
            repaired = repair_json(raw_response.content)
            parsed = json.loads(repaired)

            result = SummarizerResult(**parsed)
            chapter_summary = result.chapter_summary
            key_events = result.key_events
            character_updates = result.character_updates
            print("summary node: attempt 2 succeeded")

        except Exception as e2:
            print(f"summary node attempt 2 failed: {e2}, using fallback defaults")

    existing = [
        s for s in state.get("previous_chapter_summary", [])
        if s["chapter_number"] != chapter_number
    ]
    existing.append({
        "chapter_number": chapter_number,
        "summary": chapter_summary,
        "key_events": key_events,
        "character_updates": character_updates,
    })
    state["previous_chapter_summary"] = existing

    print("summary node working")
    return state