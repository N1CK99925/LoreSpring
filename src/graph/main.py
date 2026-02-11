from langgraph.graph import StateGraph, END
from src.graph.state import NarrativeState
from src.agents.writer import writer_agent_node
from src.agents.revision import revision_agent_node
from src.agents.summarizer import summarizer_agent_node



def route_after_review(state: NarrativeState):
    if state.get('should_revise'):
        return 'writer'
    return 'summarizer'







workflow = StateGraph(NarrativeState)
workflow.add_node("writer",writer_agent_node)
workflow.add_node("reviewer",revision_agent_node)
workflow.set_entry_point("writer")
workflow.add_edge("writer","reviewer")
workflow.add_node("summarizer",summarizer_agent_node)
workflow.add_edge("summarizer",END)
workflow.add_conditional_edges("reviewer",route_after_review)


app = workflow.compile()



if __name__ == "__main__":
    
    initial_state = {
        "project_id": "lore-test-123",
        "chapter_number": 1,
        "user_direction": "Alice discovers a hidden passage in the old mill.",
        "metadata": {
            "genre": "fantasy",
            "tone": "dark",
            "style": "literary"
        },
      
        "lore_context": {},
        "previous_chapter_summary": [],
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
    
    
    print(f"Quality: {result.get('quality_feedback', 'N/A')}")
    print(f"Final Chapter Preview:\n{result['draft']}...")
    