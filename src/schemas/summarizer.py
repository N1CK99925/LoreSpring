from pydantic import BaseModel, Field
from typing import List, Dict, Any





class SummarizerResult(BaseModel):
    chapter_summary: str = Field(
        description="Information-dense summary of the chapter in 150-250 words. Cover the main arc, key decisions, and how the chapter ends. Do not invent details not present in the draft."
    )
    key_events: List[str] = Field(
        description="Ordered list of the 3-6 most important plot events that future chapters must remain consistent with.",
        min_length=1,
        max_length=6
    )
    character_updates: Dict[str, str] = Field(
        default_factory=dict,
        description="Keyed by character name. One sentence per character describing what meaningfully changed for them this chapter — status, knowledge, relationships, or goals."
    )
   