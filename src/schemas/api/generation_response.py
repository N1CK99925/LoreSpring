from pydantic import BaseModel, ConfigDict


class GenerationResponse(BaseModel):
    project_id: str
    chapter_number: int
    final_chapter: str
    quality_score: float
    revision_count: int

    model_config = ConfigDict(strict=True)
