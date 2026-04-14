from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from api.auth.dependencies import get_current_user
from database.models.user import User
from database.session import get_database
from src.services.chapter import get_chapters

router = APIRouter( tags=["Chapters"])

@router.get("/chapters/{project_id}")
async def get_chapters_api(project_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_database)):
    chapters = await get_chapters(db, project_id, user.id)
    return [
        {
            "chapter_number": c.chapter_number,
            "final_chapter": c.final_chapter,
            "quality_score": c.quality_score,
            "revision_count": c.revision_count
        }
        for c in chapters
    ]

    
