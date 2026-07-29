from doctest import UnexpectedException

from fastapi import APIRouter, HTTPException, Request, Depends
from app.api.deps import get_current_user
from app.models.user import User
from app.services.project_service import get_project_by_id
from app.domain.generation_request import GenerationRequest
from app.domain.generation_response import GenerationResponse
from app.generation.pipeline import run_pipeline
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_database

router = APIRouter(tags=["Generation"])


@router.post("/generate", response_model=GenerationResponse)
async def generate_chapter(
    request: GenerationRequest,
    req: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
) -> GenerationResponse:
    project = await get_project_by_id(db, request.project_id, user.id)
    if not project:
        raise HTTPException(
            status_code=403, detail="Project not found or access denied"
        )
    try:
        result = await run_pipeline(request, req.app.state.checkpointer, user.id)
        return result
    except UnexpectedException as e:
        raise HTTPException(status_code=500, detail=str(e))
