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
        mode='hybrid'
    )

    system = f"""
    You are a structured narrative summarization engine.

    Your job:
    - Produce a concise but information-dense summary (150-250 words).
    - Extract the 3-6 most important plot events in order.
    - Extract meaningful character state changes — only what actually changed.
    - Do NOT invent details not present in the chapter.
    - Do NOT evaluate prose quality.

    Consider this lore context while summarizing:
    {lore_context}
    """

    user = f"""
    CHAPTER NUMBER: {chapter_number}
    GENRE: {genre}

    --- CHAPTER START ---
    {draft}
    --- CHAPTER END ---

    Summarize the chapter and extract plot events and character changes.
    """

    chapter_summary = f"Chapter {chapter_number} events."
    key_events = []
    character_updates = {}

    try:
        llm = get_llm(select_model("analysis"), temp=0, max_tokens=1500)
        structured_llm = llm.with_structured_output(SummarizerResult)
        result: SummarizerResult = structured_llm.invoke(
            [SystemMessage(content=system), HumanMessage(content=user)]
        )
        chapter_summary = result.chapter_summary
        key_events = result.key_events
        character_updates = result.character_updates
        print("summary node: attempt 1 succeeded")

    except Exception as e1:
        print(f"summary node attempt 1 failed: {e1}, trying fallback...")

        double_prompt_user = f"""
        CHAPTER NUMBER: {chapter_number}
        GENRE: {genre}

        --- CHAPTER START ---
        {draft}
        --- CHAPTER END ---

        Consider the following lore context while summarizing: {lore_context}

        Step 1: Think through the key events and character changes in this chapter carefully.
        - What is the overall narrative arc?
        - What are the 3-6 most important discrete plot events in order?
        - What changed for each character — internal state, knowledge, relationships?

        Step 2: Now format your analysis as a JSON object with exactly these fields:
        {{
            "chapter_summary": "a single string, 150-250 words summarizing the chapter",
            "key_events": ["event 1 as short string", "event 2 as short string", "event 3 as short string"],
            "character_updates": {{
                "CharacterName": "one sentence describing what changed for them"
            }}
        }}

        RULES:
        - key_events must be a list of 3-6 separate short strings, one event per item
        - character_updates values must be short single sentences
        - Return only the JSON object, no extra text
        """

        try:
            llm_raw = get_llm(select_model("analysis"), temp=0, max_tokens=1500)
            raw_response = llm_raw.invoke(
                [SystemMessage(content="You are a JSON-only summarization engine. Return only valid JSON."),
                 HumanMessage(content=double_prompt_user)]
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