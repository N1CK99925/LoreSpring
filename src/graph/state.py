from src.schemas.lore import LoreResult
from src.schemas.continuity import ContinuityResult
from src.schemas.revision import RevisionResult
from src.schemas.summarizer import SummarizerResult
from typing import TypedDict,  List, Dict

class NarrativeState(TypedDict,total= False):
    
    project_id: str
    chapter_number: int
    user_direction: str
    metadata: Dict[str,str]  
    
    lore_context: LoreResult 
    previous_chapter_summary: SummarizerResult

    draft: str

    
    

    revision_count: int
    max_revisions: int  
    should_revise : bool
    
    
    continuity_issues: ContinuityResult
    continuity_feedback : List[Dict[str,str]]
   
    revision_result: RevisionResult
    
    quality_score: float
    quality_threshold: float
    
   
    new_entities: Dict[str, str] 
    

    final_chapter: str
    chapter_summary: str 