from langgraph.errors import GraphInterrupt

NODE_MAP = {
    ("on_chain_start", "writer"): "Writing chapter",
    ("on_chain_end", "writer"): "Draft complete",
    ("on_chain_start", "continuity"): "Checking continuity",
    ("on_chain_end", "continuity"): "Continuity check complete",
    ("on_chain_start", "lorekeeper"): "Keeping lore",
    ("on_chain_end", "lorekeeper"): "Lorekeeping complete",
    ("on_chain_start", "reviewer"): "Reviewing chapter",
    ("on_chain_end", "reviewer"): "Review complete",
    ("on_chain_start", "summarizer"): "Summarizing chapter",
    ("on_chain_end", "summarizer"): "Summarization complete",
}


def map_event_to_status(
    event_type: str, node_name: str, event_data: dict
) -> dict | None:
    status = NODE_MAP.get((event_type, node_name))
    if status is None:
        return None
    return {
        "node": node_name,
        "event": event_type,
        "status": status,
        "data": event_data,
    }


async def stream_pipeline_events(graph, input_state, config):
    try:
        async for event in graph.astream_events(
            input_state, config=config, version="v2"
        ):
            if event["event"] in ("on_chain_start", "on_chain_end") and event[
                "name"
            ] == event["metadata"].get("langgraph_node"):
                status = map_event_to_status(
                    event["event"], event["name"], event.get("data", {})
                )
                if status:
                    yield status
    except GraphInterrupt as exc:
        interrupts = exc.args[0] if exc.args else ()
        yield {
            "event": "interrupt",
            "node": "human_review",
            "status": "Awaiting human review",
            "data": interrupts[0].value if interrupts else {},
        }
