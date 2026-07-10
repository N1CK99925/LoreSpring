from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from database.models.chapter import Project
from uuid import uuid4


async def get_projects(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(Project)
        .where(Project.user_id == user_id)
        .order_by(Project.created_at.desc())
    )
    projects = result.scalars().all()
    return projects


async def get_project_by_id(session: AsyncSession, project_id: str, user_id: int):
    result = await session.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    project = result.scalar_one_or_none()
    return project


async def create_project(session: AsyncSession, user_id: int, metadata: dict):
    project = Project(
        # if using UUID:
        id=str(uuid4()),
        # if using auto-increment INT → REMOVE id entirely
        user_id=user_id,
        genre=metadata.get("genre", ""),
        title=metadata.get("title", ""),
        tone=metadata.get("tone", ""),
        style=metadata.get("style", ""),
    )

    session.add(project)
    await session.commit()
    await session.refresh(project)

    return project


async def delete_project(session: AsyncSession, project_id: str, user_id: int):

    result = await session.execute(
        delete(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    if result.rowcount == 0:
        raise ValueError("Project not found")
    await session.commit()
    from src.memory.lightrag import delete_project_rag

    await delete_project_rag(user_id, project_id)
