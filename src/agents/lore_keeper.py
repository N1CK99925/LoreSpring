from src.llm.groq_client import get_llm
from src.graph.state import NarrativeState
from src.schemas.lore import LoreFacts,LoreResult


from src.memory.lightrag import insert_chapter

from langsmith import traceable


@traceable(name="lore_keeper")
async def lore_keeper_node(state: NarrativeState) -> NarrativeState:
    draft = state.get("draft")
    chapter_number = state.get("chapter_number")
    
    if not draft:
        return state
    
    
    await insert_chapter(draft, chapter_number)
    
    state["lore_context"] = {"ready": True, "chapter": chapter_number}
    print(f"lore keeper: chapter {chapter_number} indexed into LightRAG")
    return state