import operator
from typing import TypedDict, Annotated, List, Dict, Optional, Union, Any

class NarrativeState(TypedDict,total= False):
    
    project_id: str
    chapter_number: int
    user_direction: str
    metadata: Dict[str, Any]  
    
    lore_context: Dict[str, List[Dict[str, Any]]] 
    previous_chapter_summary: List[Dict[str,Any]]
    
    draft: str

    messages: Annotated[List[Any], operator.add]
    

    revision_count: int
    max_revisions: int  
    should_revise : bool
    
    
    continuity_issues: List[Dict[str, str]]
    continuity_feedback : str
   
    quality_metrics: Dict[str, float]
    quality_feedback: str
    quality_score: float
    quality_threshold: float
    
   
    new_entities: Dict[str, Any] 
    

    final_chapter: str
    chapter_summary: str 