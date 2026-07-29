from app.llm.client import get_llm
from app.generation.state import NarrativeState
from app.domain.lore import LoreFacts, LoreResult


from app.memory.rag import insert_chapter

from langsmith import traceable


@traceable(name="lore_keeper")
async def lore_keeper_node(state: NarrativeState) -> NarrativeState:
    user_id = state.get("user_id")
    project_id = state.get("project_id")
    draft = (
        state.get("revised_chapter_text")
        or state.get("final_chapter")
        or state.get("draft")
    )
    chapter_number = state.get("chapter_number")

    if not draft:
        return state

    await insert_chapter(user_id, project_id, draft, chapter_number)

    print(f"lore keeper: chapter {chapter_number} indexed into LightRAG")
    return {}
