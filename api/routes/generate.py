from fastapi import APIRouter, Request
from src.schemas.api.generation_request import GenerationRequest
from src.schemas.api.generation_response import GenerationResponse
from src.graph.pipeline import run_pipeline

router = APIRouter(tags=["Generation"])




@router.post("/generate",response_model=GenerationResponse)
async def generate_chapter(request: GenerationRequest,req: Request) -> GenerationResponse:
    result = await run_pipeline(request, req.app.state.checkpointer)
    return result