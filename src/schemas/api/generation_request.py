from pydantic import BaseModel, Field



class StoryMetadata(BaseModel):
    genre: str = Field(min_length=1)
    tone: str = Field(min_length=1)
    style: str = Field(min_length=1)
    
    
class GenerationRequest(BaseModel):
    chapter_number: int = Field(gt=0)
    quality_threshold: float = Field(default=7.0, ge=1.0, le=10.0)
    max_revisions: int = Field(default=2, ge=1, le=5)
    project_id: str = Field(min_length=1)
    user_direction: str = Field(min_length=10)
    metadata: StoryMetadata


class CreateProjectRequest(BaseModel):
    title: str
    description: str
    genre: str = ""
    tone: str = ""
    style: str = ""