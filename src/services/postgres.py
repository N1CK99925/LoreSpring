from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.models.chapter import Project, Chapter, ChapterSummary



async def get_or_create_project(session: AsyncSession,project_id: str, metadata:dict) -> Project:
    project = await session.execute(select(Project).where(Project.id == project_id))
    project = project.scalars().first()
    if project:
        return project
    else:
        project = Project(
            id=project_id,
            genre=metadata.get("genre", ""),
            title=metadata.get("title", ""),
            tone=metadata.get("tone", ""),
            style=metadata.get("style", "")
        )
        session.add(project)
        await session.commit()
        await session.refresh(project)
        return project
    
    # TODO: check if this goes againstt the user id forign key 
    
    
async def save_chapter(session: AsyncSession, project_id: str , chapter_number: int, user_direction: str, final_chapter: str, quality_score: float, revision_count: int) -> Chapter:
    
    chapter = Chapter(
        project_id=project_id,
        chapter_number=chapter_number,
        user_direction=user_direction,
        final_chapter=final_chapter,
        quality_score=quality_score,
        revision_count=revision_count
    )
    session.add(chapter)
    await session.commit()
    await session.refresh(chapter)
    return chapter


async def save_summary(session: AsyncSession, chapter_id: int, summary: str, key_events: list, chapter_updates: dict) -> ChapterSummary:
    chapter_summary = ChapterSummary(
        chapter_id=chapter_id,
        summary=summary,
        key_events=key_events,
        character_updates=chapter_updates
    )
    session.add(chapter_summary)
    await session.commit()
    await session.refresh(chapter_summary)
    return chapter_summary


async def get_project_summaries(session: AsyncSession, project_id: str) -> list:
    result = await session.execute(
        select(ChapterSummary, Chapter.chapter_number)
        .join(Chapter, ChapterSummary.chapter_id == Chapter.id)
        .where(Chapter.project_id == project_id)
        .order_by(Chapter.chapter_number)
    )
    
    rows = result.all()
    
    return [
        {
            "chapter_number": chapter_number,
            "summary": summary.summary,
            "key_events": summary.key_events,
            "character_updates": summary.character_updates
        }
        for summary, chapter_number in rows
    ]
