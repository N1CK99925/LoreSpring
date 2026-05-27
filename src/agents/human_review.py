from langgraph.types import interrupt
from src.graph.state import NarrativeState

async def human_review_node(state: NarrativeState):

    review_result = interrupt({
        "chapter_number": state["chapter_number"],
        "final_chapter": state["final_chapter"],
        "quality_score": state["quality_score"],
        "chapter_summary": state["chapter_summary"]
    })

    revised_text = review_result.get(
        "revised_chapter_text",
        state["final_chapter"]
    )

    return {
        "revised_chapter_text": revised_text,
        "final_chapter": revised_text
    }