from langgraph.graph import StateGraph, END
from src.graph.state import NarrativeState
from src.agents.writer import writer_agent_node
from src.agents.revision import revision_agent_node
from src.agents.summarizer import summarizer_agent_node
from src.agents.continuity import continue_agent_node
import json 
from pathlib import Path

MEMORY_PATH = Path("memory.json")

def load_memory():
    if MEMORY_PATH.exists():
        with open(MEMORY_PATH,'r') as f:
            return json.load(f)
    return []







def route_after_review(state: NarrativeState):
    revision_count = state.get("revision_count", 0)
    max_revisions = state.get("max_revisions", 2)

    if revision_count >= max_revisions:
        return "summarizer"

    has_critical_continuity = len(state.get("continuity_feedback", [])) > 0
    below_quality_threshold = state.get("quality_score", 0) < state.get("quality_threshold", 7.5)

    if has_critical_continuity or below_quality_threshold:
        return "writer"

    return "summarizer"







workflow = StateGraph(NarrativeState)
workflow.add_node("writer",writer_agent_node)
workflow.add_node("reviewer",revision_agent_node)
workflow.add_node("summarizer",summarizer_agent_node)
workflow.add_node("continuity",continue_agent_node)
workflow.set_entry_point("writer")
workflow.add_edge("writer","reviewer")
workflow.add_edge("reviewer","continuity")
workflow.add_conditional_edges("continuity",route_after_review)
workflow.add_edge("summarizer",END)


app = workflow.compile()

previous_memory = load_memory()

if __name__ == "__main__":
    
    initial_state = {
        "project_id": "lore-test-123",
        "chapter_number": 3,
        "user_direction": """
            Lady Harrington returns with a Ministry inspector.
            The inspector attempts to magically scan the loom.
            Rowan must use the system covertly to mask the mana signature in real time.
            Aldric is mentioned as being away on a supply run.
            End with the inspector filing an inconclusive report.
        """,
        "metadata": {
            "genre": "fantasy",
            "tone": "dark",
            "style": "literary"
        },
      
        "lore_context": {},
        "previous_chapter_summary": previous_memory,
        "draft": "",
        "revision_count": 0,
        "issues": [],
        "quality_metrics": {},
        "new_entities": {},
        "final_chapter": "",
        "max_revisions": 3,
        "should_revise": False

    }
    
    
    config = {"configurable": {"thread_id": "test-run-1"}}
    print("run")
    
    
    # Sync invoke
    result = app.invoke(initial_state, config=config)
    def persist_memory(state):
        memory = state.get("previous_chapter_summary", [])
        with open(MEMORY_PATH, "w") as f:
            json.dump(memory, f, indent=2)

    persist_memory(result)
    print(result)
    
    print(f"Quality: {result.get('quality_feedback', 'N/A')}")
    print(f"Final Chapter Preview:\n{result['draft']}...")
    