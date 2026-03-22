from langgraph.types import interrupt
from src.graph.state import NarrativeState

def human_review_node(state:NarrativeState):
    interrupt({
        "chapter_number":state["chapter_number"],
        "final_chapter": state["final_chapter"],
        "quality_score": state["quality_score"],
        "chapter_summary":state["chapter_summary"]
    })
    return {}
    
    