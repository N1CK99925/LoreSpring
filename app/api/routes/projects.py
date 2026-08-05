import json

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.models.user import User
from app.db.session import get_database
from app.domain.generation_request import CreateProjectRequest, GenerationRequest
from app.services.project_service import create_project, get_projects, get_project_by_id
from app.generation.graph import build_graph
from app.generation.graph_events import stream_pipeline_events
from app.generation.pipeline import build_config, build_initial_state
from app.db.repositories.postgres import get_project_summaries
from app.core.limiter import limiter, user_id_key
from app.config.rate_limits import RateLimits

router = APIRouter(tags=["Projects"])


@router.post("/projects")
async def create_project_api(
    body: CreateProjectRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    project = await create_project(db, user.id, metadata=body.model_dump())
    return {"id": project.id, "title": project.title}


@router.get("/projects")
async def get_projects_api(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_database)
):
    projects = await get_projects(db, user.id)
    return [
        {"id": p.id, "title": p.title, "created_at": p.created_at} for p in projects
    ]


@router.get("/projects/{project_id}")
async def get_project_api(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    project = await get_project_by_id(db, project_id, user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {
        "id": project.id,
        "title": project.title,
        "genre": project.genre,
        "tone": project.tone,
        "style": project.style,
        "created_at": project.created_at,
    }


# TODO: change to responsemodels


@router.post("/projects/{project_id}/chapters/{chapter_number}/generate/stream")
@limiter.limit(RateLimits.LLM.STREAM, key_func=user_id_key)
async def generate_stream(
    project_id: str,
    chapter_number: int,
    body: GenerationRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    if body.project_id != project_id or body.chapter_number != chapter_number:
        raise HTTPException(
            status_code=400,
            detail="Path params must match request body (project_id, chapter_number)",
        )

    project = await get_project_by_id(db, project_id, user.id)
    if not project:
        raise HTTPException(status_code=403, detail="Project not found or access denied")

    previous_memory = await get_project_summaries(db, project_id, user.id)
    graph = build_graph(request.app.state.checkpointer)
    input_state = build_initial_state(body, user.id, previous_memory)
    config = build_config(body)

    async def event_generator():
        async for status in stream_pipeline_events(graph, input_state, config):
            yield f"data: {json.dumps(status)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
