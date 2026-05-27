from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from langgraph.types import Command
from database.session import AsyncSessionLocal, get_database
from sqlalchemy.ext.asyncio import AsyncSession
from src.services.postgres import save_chapter, save_summary
from src.graph.main import build_graph

from api.auth.dependencies import get_current_user
from database.models.user import User
from sqlalchemy import select
from database.models.chapter import Project
router = APIRouter(tags=["Review"])


class ResumeRequest(BaseModel):
    approved: bool
    revised_chapter_text: Optional[str] = Field(None, alias="chapterText")


@router.get("/review/{thread_id}")
async def get_review(thread_id: str, req: Request, user : User = Depends(get_current_user), db : AsyncSession = Depends(get_database)):
    project_id = thread_id.split("-chapter-")[0]
    statement = select(Project).where(Project.id == project_id, Project.user_id == user.id)
    db_result = await db.execute(statement)
    project = db_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this thread")
    checkpointer = req.app.state.checkpointer
    config = {"configurable": {"thread_id": thread_id}}
    
    state = await checkpointer.aget_tuple(config)
    
    if not state:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    pending_tasks = state.pending_writes
    if not pending_tasks:
        raise HTTPException(status_code=400, detail="No pending interrupt for this thread")
    
    
    for task_id, channel, value in pending_tasks:
        if channel == "__interrupt__":
            return value.value
    
    raise HTTPException(status_code=400, detail="No interrupt found")

@router.post("/resume/{thread_id}")
async def resume_pipeline(thread_id: str, body: ResumeRequest, req: Request, user : User = Depends(get_current_user), db : AsyncSession = Depends(get_database)):
    project_id = thread_id.split("-chapter-")[0]
    statement = select(Project).where(Project.id == project_id, Project.user_id == user.id)
    db_result = await db.execute(statement)
    project = db_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this thread")
    checkpointer = req.app.state.checkpointer
    app = build_graph(checkpointer)
    config = {"configurable": {"thread_id": thread_id}}

    result = await app.ainvoke(
        Command(resume={"approved": body.approved, "revised_chapter_text": body.revised_chapter_text}),
        config=config
    )
    print("DEBUG: Pipeline resumed with result:")
    print(result)
    if body.approved:
        
        async with AsyncSessionLocal() as session:
            chapter = await save_chapter(
                session,
                result.get("project_id"),
                result.get("chapter_number"),
                result.get("user_direction"),
                result.get("final_chapter", ""),
                result.get("quality_score", 0.0),
                result.get("revision_count", 0)
            )
            summary_data = result.get("previous_chapter_summary", [])
            latest = next(
                (s for s in summary_data if s["chapter_number"] == result.get("chapter_number")),
                None
            )
            if latest:
                await save_summary(
                    session,
                    chapter.id,
                    latest["summary"],
                    latest["key_events"],
                    latest["character_updates"]
                )
        return {"status": "approved", "chapter_number": result.get("chapter_number")}

    return {"status": "rejected", "message": "Chapter rejected, pipeline discarded"}