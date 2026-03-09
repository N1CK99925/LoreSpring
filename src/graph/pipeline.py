from src.graph.main import build_graph, load_memory
from src.graph.state import NarrativeState
from src.schemas.api.generation_request import GenerationRequest
from src.schemas.api.generation_response import GenerationResponse
from pathlib import Path
import json

MEMORY_PATH = Path("memory.json")




async def run_pipeline(request: GenerationRequest ) -> GenerationResponse:
    app = build_graph()
    previous_memory = load_memory()
    
    initial_state = {
        "project_id": request.project_id,
        "chapter_number": request.chapter_number,
        "user_direction": request.user_direction,
        "metadata": request.metadata.model_dump(),
        "quality_threshold": request.quality_threshold,
        "max_revisions": request.max_revisions,
        
        "lore_context": {},
        "previous_chapter_summary": previous_memory,
        "draft": "",
        "revision_count": 0,
        
        "new_entities": {},
        "final_chapter": "",
        "should_revise": False
    }
    
    config = {"configurable": {"thread_id": f"{request.project_id}-chapter-{request.chapter_number}"}}
    print(f"Starting pipeline for project {request.project_id}, chapter {request.chapter_number}")
    
    result = await app.ainvoke(initial_state,config=config)
    
    memory = result.get("previous_chapter_summary", [])
    with open(MEMORY_PATH, "w") as f:
        json.dump(memory, f, indent=2)
        
        
    print(result)
    return GenerationResponse(
        final_chapter=result.get("final_chapter", ""),
        revision_count=result.get("revision_count", 0),
        quality_score=result.get("quality_score", 0.0),
        chapter_number=request.chapter_number,
        project_id=request.project_id
        
    )
    
    