from langgraph.graph import StateGraph, END
from src.graph.state import NarrativeState
from src.agents.writer import writer_agent_node


workflow = StateGraph(NarrativeState)
workflow.add_node("writer",writer_agent_node)
workflow.set_entry_point("writer")
workflow.add_edge("writer",END)


app = workflow.compile()



if __name__ == "__main__":
    # Minimal Phase 2 state (expand as you add fields)
    initial_state = {
        "project_id": "lore-test-123",
        "chapter_number": 1,
        "user_direction": "Alice discovers a hidden passage in the old mill.",
        "metadata": {
            "genre": "fantasy",
            "tone": "dark",
            "style": "literary"
        },
        # Phase 5+: Auto-filled by retrieve_context
        "lore_context": {},
        "previous_chapters": [],
        "draft": "",
        "revision_count": 0,
        "issues": [],
        "quality_score": 0.0,
        "new_entities": {},
        "final_chapter": ""
    }
    
    # Run full graph
    config = {"configurable": {"thread_id": "test-run-1"}}
    print("🚀 Running Lore Spring workflow...")
    
    # Sync invoke
    result = app.invoke(initial_state, config=config)
    
    
    print(f"Quality: {result.get('quality_score', 'N/A')}")
    print(f"Final Chapter Preview:\n{result['draft'][:500]}...")
    