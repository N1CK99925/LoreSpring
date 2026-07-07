from doctest import UnexpectedException

from fastapi import APIRouter, HTTPException, Request, Depends
from api.auth.dependencies import get_current_user
from database.models.user import User
from src.services.project import get_project_by_id
from src.schemas.api.generation_request import GenerationRequest
from src.schemas.api.generation_response import GenerationResponse
from src.graph.pipeline import run_pipeline
from sqlalchemy.ext.asyncio import AsyncSession
from database.session import get_database
router = APIRouter(tags=["Generation"])




@router.post("/generate", response_model=GenerationResponse)
async def generate_chapter(
    request: GenerationRequest,
    req: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
) -> GenerationResponse:
    project = await get_project_by_id(db, request.project_id, user.id)
    if not project:
        raise HTTPException(status_code=403, detail="Project not found or access denied")
    try:
        result = await run_pipeline(request, req.app.state.checkpointer, user.id)  
        return result
    except UnexpectedException as e:
        raise HTTPException(status_code=500, detail=str(e))
