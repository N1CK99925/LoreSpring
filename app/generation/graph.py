import asyncio
from langgraph.graph import StateGraph, END
from app.generation.agents.human_review import human_review_node
from app.generation.state import NarrativeState
from app.generation.agents.writer import writer_agent_node
from app.generation.agents.revision import revision_agent_node
from app.generation.agents.summarizer import summarizer_agent_node
from app.generation.agents.continuity import continue_agent_node
from app.generation.agents.lore_keeper import lore_keeper_node
import json
from pathlib import Path
from app.config.settings import settings
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langsmith import traceable


def route_after_review(state):
    revision_count = state.get("revision_count", 0)
    max_revisions = state.get("max_revisions", 2)

    if revision_count >= max_revisions:
        return "summarizer"

    below_threshold = state.get("quality_score", 0) < state.get(
        "quality_threshold", 7.0
    )
    return "writer" if below_threshold else "summarizer"


def route_after_continuity(state):
    has_critical = len(state.get("continuity_feedback", [])) > 0
    revision_count = state.get("revision_count", 0)
    max_revisions = state.get("max_revisions", 2)

    if has_critical and revision_count < max_revisions:
        return "writer"
    return "reviewer"


# TODO: bring summarizer to to after human


def build_graph(checkpointer=None):
    workflow = StateGraph(NarrativeState)
    workflow.add_node("writer", writer_agent_node)
    workflow.add_node("reviewer", revision_agent_node)
    workflow.add_node("summarizer", summarizer_agent_node)
    workflow.add_node("continuity", continue_agent_node)
    workflow.add_node("lorekeeper", lore_keeper_node)
    workflow.add_node("human_review", human_review_node)
    workflow.set_entry_point("writer")
    workflow.add_edge("writer", "continuity")
    workflow.add_conditional_edges("continuity", route_after_continuity)
    workflow.add_conditional_edges("reviewer", route_after_review)
    workflow.add_edge("summarizer", "human_review")
    workflow.add_edge("human_review", "lorekeeper")
    workflow.add_edge("lorekeeper", END)
    return workflow.compile(checkpointer=checkpointer)
