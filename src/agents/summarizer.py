from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from langchain_core.messages import HumanMessage, SystemMessage
import json


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
    - Extract major plot events.
    - Extract meaningful character state changes.
    - Do NOT invent new story details.
    - Do NOT evaluate quality.
    - Output ONLY valid JSON.
    """

    user = f"""
    CHAPTER NUMBER: {chapter_number}
    GENRE: {genre}

    --- CHAPTER START ---
    {draft}
    --- CHAPTER END ---

    Return ONLY valid JSON in this format:

    {{
        "chapter_summary": "string",
        "key_events": [
            "event 1",
            "event 2"
        ],
        "character_updates": {{
            "CharacterName": "state change description"
        }}
    }}
    """

    llm = get_llm(
        select_model("analysis"),
        temp=0.2,
        max_tokens=800
    )

    messages = [
        SystemMessage(content=system),
        HumanMessage(content=user)
    ]

    response = llm.invoke(messages)

    try:
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
        parsed = json.loads(content)
    except Exception:
        parsed = {}

    chapter_summary = parsed.get("chapter_summary", "")
    key_events = parsed.get("key_events", [])
    character_updates = parsed.get("character_updates", {})
    print("summary node working")
    print("chapter summary ---  ",chapter_summary)
    
    if "previous_chapter_summary" not in state:
        state["previous_chapter_summary"] = []

    state["previous_chapter_summary"].append({
        "chapter_number": chapter_number,
        "summary": chapter_summary,
        "key_events": key_events,
        "character_updates": character_updates
    })

    return state
