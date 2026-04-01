from fastapi import APIRouter, Request, Depends
from api.auth.dependencies import get_current_user
from database.models.user import User
from src.schemas.api.generation_request import GenerationRequest
from src.schemas.api.generation_response import GenerationResponse
from src.graph.pipeline import run_pipeline

router = APIRouter(tags=["Generation"])




@router.post("/generate",response_model=GenerationResponse)
async def generate_chapter(request: GenerationRequest,req: Request, user : User = Depends(get_current_user)) -> GenerationResponse:
    result = await run_pipeline(request, req.app.state.checkpointer)
    return result