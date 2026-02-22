from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from src.schemas.summarizer import SummarizerResult
from src.schemas.lore import LoreFacts
from src.agents.utils import merge_lore
from langchain_core.messages import HumanMessage, SystemMessage


def summarizer_agent_node(state: NarrativeState) -> NarrativeState:
    draft = state.get("draft")
    chapter_number = state.get("chapter_number")
    metadata = state.get("metadata", {})
    genre = metadata.get("genre", "fantasy")

    if not draft:
        return state

    system = """
    You are a structured narrative summarization engine.

    Your job:
    - Produce a concise but information-dense summary (150-250 words).
    - Extract the 3-6 most important plot events in order.
    - Extract meaningful character state changes — only what actually changed.
    - Do NOT invent details not present in the chapter.
    - Do NOT evaluate prose quality.
    """

    user = f"""
    CHAPTER NUMBER: {chapter_number}
    GENRE: {genre}

    --- CHAPTER START ---
    {draft}
    --- CHAPTER END ---

    Summarize the chapter and extract plot events and character changes.
    """

    llm = get_llm(select_model("extraction"), temp=0.2, max_tokens=1500)
    structured_llm = llm.with_structured_output(SummarizerResult)

    print("summary node working")

    try:
        result: SummarizerResult = structured_llm.invoke(
            [SystemMessage(content=system), HumanMessage(content=user)]
        )
        chapter_summary = result.chapter_summary
        key_events = result.key_events
        character_updates = result.character_updates

    except Exception as e:
        print(f"Summarizer failed: {e}, using fallback")
        chapter_summary = f"Chapter {chapter_number} events."
        key_events = []
        character_updates = {}

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

    return state