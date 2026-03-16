from fastapi import APIRouter
from src.schemas.api.generation_request import GenerationRequest
from src.schemas.api.generation_response import GenerationResponse
from src.graph.pipeline import run_pipeline

router = APIRouter(tags=["Generation"])




@router.post("/generate",response_model=GenerationResponse)
async def generate_chapter(request: GenerationRequest) -> GenerationResponse:
    result = await run_pipeline(request)
    return result