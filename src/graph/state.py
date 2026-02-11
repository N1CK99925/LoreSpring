import operator
from typing import TypedDict, Annotated, List, Dict, Optional, Union, Any

class NarrativeState(TypedDict,total= False):
    # --- 1. Identity & Inputs ---
    project_id: str
    chapter_number: int
    user_direction: str
    metadata: Dict[str, Any]  # Genre, tone, POV, author_style
    
    # --- 2. The Context (RAG & Memory) ---
    # We treat lore as a dictionary to pass JSON directly to the LLM
    lore_context: Dict[str, List[Dict[str, Any]]] 
    previous_chapter_summary: List[Dict[str,Any]]
    
    # --- 3. The Core Artifact (The Writing) ---
    draft: str
    # 'messages' allows us to keep a chat log if humans chat with agents
    # Annotated[list, operator.add] means new messages append, don't overwrite
    messages: Annotated[List[Any], operator.add]
    
    # --- 4. Control Flow & Loop Management ---
    revision_count: int
    max_revisions: int  # Configurable limit per chapter
    should_revise : bool
    
    # --- 5. Review & Quality Signals ---
    # Continuity errors found by the Continuity Agent
    continuity_issues: List[Dict[str, str]] 
    # Quality metrics (pacing, prose) from Quality Agent
    quality_metrics: Dict[str, float]
    quality_feedback: str
    quality_score: float
    quality_threshold: float
    
    # Lore Extraction
    new_entities: Dict[str, Any] 
    

    final_chapter: str
    chapter_summary: str 