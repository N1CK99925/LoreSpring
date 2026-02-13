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
    
    - Extract stable lore facts that must remain consistent later.
    - Include character traits, appearance, known relationships, locations, and important objects.
    - Only include facts explicitly present in the chapter.

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
    }},
    "lore_facts": {{
        "characters": {{}},
        "locations": {{}},
        "objects": {{}}
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

        print("RAW SUMMARIZER RESPONSE:\n", content)

        
        if content.startswith("```"):
            content = content.strip("`")
            content = content.replace("json", "", 1).strip()

        
        start = content.find("{")
        end = content.rfind("}") + 1
        content = content[start:end]

        parsed = json.loads(content)

    except Exception as e:
        print("Summarizer JSON parse failed:", e)
        print(response.content)
        parsed = {}
 


    chapter_summary = parsed.get("chapter_summary", "")
    key_events = parsed.get("key_events", [])
    character_updates = parsed.get("character_updates", {})
    lore_facts = parsed.get('lore_facts',{})
    print("summary node working")
    print("chapter summary ---  ",chapter_summary)
    
    if "previous_chapter_summary" not in state:
        state["previous_chapter_summary"] = []

    state["previous_chapter_summary"].append({
        "chapter_number": chapter_number,
        "summary": chapter_summary,
        "key_events": key_events,
        "character_updates": character_updates,
        "lore_facts":lore_facts
        
        
    })

    return state

# TODO merge lore context with lore keeper