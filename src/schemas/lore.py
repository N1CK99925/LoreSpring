from pydantic import BaseModel, Field
from typing import  Dict, Any


    
class Location(BaseModel):
    description: str
    significance: str = ""
    rules: Dict[str, Any] = Field(default_factory=dict)

class Object(BaseModel):
    appearance: str = ""
    powers: str = ""
    holder: str = ""

class LoreFacts(BaseModel):
    characters: Dict[str, str] = Field(
        default_factory=dict,
        description="Character lore keyed by name. Include traits, appearance, relationships, and role. Only facts explicitly in the chapter."
    )
    locations: Dict[str, Location] = Field(
        default_factory=dict,
        description="Location lore keyed by place name. Include description, significance, and any rules governing the place."
    )
    objects: Dict[str, Object] = Field(
        default_factory=dict,
        description="Important objects keyed by name. Include appearance, powers, and current holder. Only if plot-relevant."
    )
    
class LoreResult(BaseModel):
    lore_facts:LoreFacts
    