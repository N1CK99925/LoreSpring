from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from api.auth.dependencies import get_current_user
from database.models.user import User
from database.session import get_database
from src.schemas.api.generation_request import CreateProjectRequest
from src.services.project import create_project, get_projects, get_project_by_id

router = APIRouter( tags=["Projects"])

@router.post("/projects")
async def create_project_api(body: CreateProjectRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_database)):
    project = await create_project(db, user.id, metadata = body.model_dump())
    return {"id": project.id, "title": project.title}

@router.get("/projects")
async def get_projects_api(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_database)):
    projects = await get_projects(db, user.id)
    return [{"id": p.id, "title": p.title, "created_at": p.created_at} for p in projects]

@router.get("/projects/{project_id}")
async def get_project_api(project_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_database)):
    project = await get_project_by_id(db, project_id, user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"id": project.id, "title": project.title}



# TODO: change to responsemodels 