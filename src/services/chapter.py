from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select,delete
from database.models.chapter import Chapter,ChapterSummary, Project

async def get_chapters(session: AsyncSession, project_id: str,user_id:int):
    result = await session.execute(
        select(Chapter).join(Project).where(Chapter.project_id == project_id, Project.user_id == user_id).order_by(Chapter.chapter_number))
    chapters = result.scalars().all()
    return chapters

async def get_chapter_summary(session:AsyncSession, project_id: str, chapter_id: int, user_id: int):
    result = await session.execute(
        select(ChapterSummary)
        .join(Chapter, ChapterSummary.chapter_id == Chapter.id)
        .join(Project, Chapter.project_id == Project.id)  
        .where(
            Chapter.project_id == project_id, 
            Chapter.id == chapter_id,
            Project.user_id == user_id  
        )
    )
    result = result.scalar_one_or_none()
    return result

async def get_chapter_by_number(session:AsyncSession,project_id: str,chapter_number: int,user_id: int):
    result = await session.execute(
        select(Chapter).join(Project).where(
    Chapter.project_id == project_id,
    Chapter.chapter_number == chapter_number,
    Project.user_id == user_id
)
    )
    chapter = result.scalar_one_or_none()
    return chapter


async def delete_chapter():
    pass


async def delete_chapter_summary():
    pass


async def update_chapter():
    pass

