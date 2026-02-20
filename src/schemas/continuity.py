from pydantic import BaseModel, Field
from typing import List, Literal


class ContinuityIssue(BaseModel):
    type: Literal["contradiction", "timeline", "character", "object", "location"] = Field(
        description="Category of the continuity issue: contradiction (direct factual conflict), timeline (impossible sequence of events), character (inconsistent traits or status), object (item changes identity or impossibly reappears), location (impossible movement or setting conflict)"
    )
    description: str = Field(
        description="Clear, specific explanation of the issue referencing both the established memory and the conflicting draft passage"
    )
    severity: Literal["high", "medium", "low"] = Field(
        description="high = impossible (dead character speaks, timeline breaks), medium = strong logical conflict, low = possible but unlikely interpretation difference"
    )


class ContinuityResult(BaseModel):
    continuity_issues: List[ContinuityIssue] = Field(
        default_factory=list,
        description="List of detected continuity issues. Empty list if no direct contradictions found. Missing information is never a contradiction."
    )