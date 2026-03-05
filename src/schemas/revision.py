from pydantic import BaseModel, Field
from typing import List


class QualityMetrics(BaseModel):
    pacing: float = Field(
        description="How well the chapter controls narrative speed. 0-3 = scenes drag or rush without purpose, 4-6 = uneven but functional, 7-8 = deliberate and effective, 9-10 = exceptional rhythm throughout")
    character_depth: float = Field(
        description="How distinct, motivated, and human the characters feel. 0-3 = flat archetypes with no interiority, 4-6 = functional but generic, 7-8 = clear voices and believable motivation, 9-10 = fully realized")
    prose_clarity: float = Field(
        description="How clean and purposeful the writing is. 0-3 = cluttered, confusing, or redundant, 4-6 = readable but padded with filler, 7-8 = precise and active, 9-10 = every sentence earns its place")
    tension: float = Field(
        description="How much dramatic stakes and conflict are felt. 0-3 = no stakes or conflict, 4-6 = tension stated but not dramatized, 7-8 = reader feels the pressure, 9-10 = gripping throughout")
    prompt_adherence: float = Field(
        description="How faithfully the chapter executes the user direction. 0-3 = ignores key requirements, 4-6 = partial compliance with gaps, 7-8 = hits all major beats, 9-10 = exceeds the brief")


class RevisionResult(BaseModel):
    quality_metrics: QualityMetrics = Field(
        description="Numerical scores across five narrative dimensions. Be conservative — most drafts score 5-7.")
    quality_feedback: List[str] = Field(
        description="Exactly 3 concise bullet points identifying the most critical weaknesses. Each should name a specific problem, not a generic observation.",
        min_length=3,
        max_length=3)