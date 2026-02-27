import asyncio
from langgraph.graph import StateGraph, END
from src.graph.state import NarrativeState
from src.agents.writer import writer_agent_node
from src.agents.revision import revision_agent_node
from src.agents.summarizer import summarizer_agent_node
from src.agents.continuity import continue_agent_node
from src.agents.lore_keeper import lore_keeper_node
import json
from pathlib import Path

from langsmith import traceable

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
    below_quality_threshold = state.get("quality_score", 0) < state.get("quality_threshold")

    if has_critical_continuity or below_quality_threshold:
        return "writer"

    return "summarizer"

async def main():
    workflow = StateGraph(NarrativeState)
    workflow.add_node("writer", writer_agent_node)
    workflow.add_node("reviewer", revision_agent_node)
    workflow.add_node("summarizer", summarizer_agent_node)
    workflow.add_node("continuity", continue_agent_node)
    workflow.add_node("lorekeeper",lore_keeper_node)
    workflow.set_entry_point("writer")
    workflow.add_edge("writer", "reviewer")
    workflow.add_edge("reviewer", "continuity")
    workflow.add_conditional_edges("continuity", route_after_review)
    workflow.add_edge("summarizer", "lorekeeper")
    workflow.add_edge("lorekeeper",END)
    app = workflow.compile()

    previous_memory = load_memory()

    initial_state = {
        "project_id": "lore-test-123",
        "chapter_number": 1,
        "user_direction": """
           Rowan finishes masking the loom and offers the Inspector a cup of herbal tea to ease the tension. Thompson accepts, but his eyes stay fixed on her hands, looking for the callouses of a mage rather than a weaver. He asks her directly where Aldric is. Rowan must lie convincingly while feeling the physical strain of the mana shield she just held.
        """.strip(),
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
        "quality_threshold":7.0,
        "new_entities": {},
        "final_chapter": "",
        "max_revisions": 2,
        "should_revise": False
    }

    config = {"configurable": {"thread_id": "test-run-1"}}
    print("run")

    
    result = await app.ainvoke(initial_state, config=config)

   
    memory = result.get("previous_chapter_summary", [])
    with open(MEMORY_PATH, "w") as f:
        json.dump(memory, f, indent=2)

    print(result)
    print(f"Quality: {result.get('quality_feedback', 'N/A')}")
    print(f"Final Chapter Preview:\n{result['draft']}...")

if __name__ == "__main__":
    asyncio.run(main())