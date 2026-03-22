
from database.session import  AsyncSessionLocal

from src.graph.main import build_graph
from src.schemas.api.generation_request import GenerationRequest
from src.schemas.api.generation_response import GenerationResponse
from src.services.postgres import get_project_summaries, get_or_create_project






async def run_pipeline(request: GenerationRequest ,checkpointer) -> GenerationResponse:
    async with AsyncSessionLocal() as session:
        
        previous_memory = await get_project_summaries(session, request.project_id)
        app = build_graph(checkpointer)
        
        
        await get_or_create_project(session, request.project_id, request.metadata.model_dump())
        
    
    
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
    
       
      
        
        
    print(result)
    return GenerationResponse(
        final_chapter=result.get("final_chapter", ""),
        revision_count=result.get("revision_count", 0),
        quality_score=result.get("quality_score", 0.0),
        chapter_number=request.chapter_number,
        project_id=request.project_id
        
    )
    
    