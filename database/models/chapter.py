from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, Text, JSON, DateTime, ForeignKey
from datetime import datetime, timezone
from database.base import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    genre: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    tone: Mapped[str] = mapped_column(String(255), nullable=False)
    style: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    user: Mapped["User"] = relationship("User", back_populates="projects")  # type: ignore
    chapters: Mapped[list["Chapter"]] = relationship(
        "Chapter", back_populates="project"
    )


class Chapter(Base):
    __tablename__ = "chapters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[str] = mapped_column(
        String(255), ForeignKey("projects.id"), nullable=False
    )
    chapter_number: Mapped[int] = mapped_column(Integer, nullable=False)
    user_direction: Mapped[str] = mapped_column(Text, nullable=False)

    revision_count: Mapped[int] = mapped_column(Integer, default=0)
    quality_score: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    final_chapter: Mapped[str] = mapped_column(Text, nullable=True)
    project: Mapped["Project"] = relationship("Project", back_populates="chapters")


class ChapterSummary(Base):
    __tablename__ = "chapter_summaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chapter_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("chapters.id"), nullable=False
    )
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    key_events: Mapped[list] = mapped_column(JSON, default=list)
    character_updates: Mapped[dict] = mapped_column(JSON, default=dict)
