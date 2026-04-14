from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select,delete
from database.models.chapter import Chapter,ChapterSummary

async def get_chapters(session: AsyncSession, project_id: str):
    result = await session.execute(
        select(Chapter).where(Chapter.project_id == project_id).order_by(Chapter.chapter_number))
    chapters = result.scalars().all()
    return chapters

async def get_chapter_summary(session:AsyncSession,project_id: str, chapter_id: int):
    result = await session.execute(
        select(ChapterSummary)
        .join(Chapter,ChapterSummary.chapter_id == chapter_id)
        .where(Chapter.project_id == project_id, Chapter.id == chapter_id)
    )
    result = result.scalar_one_or_none()
    return result

async def get_chapter_by_number(session:AsyncSession,project_id: str,chapter_number: int):
    result = await session.execute(
        select(Chapter).where(Chapter.project_id == project_id, Chapter.chapter_number == chapter_number)
    )
    chapter = result.scalar_one_or_none()
    return chapter


async def delete_chapter():
    pass


async def delete_chapter_summary():
    pass


async def update_chapter():
    pass

