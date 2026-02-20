# TODO: Upgrade to subgraph when v1 over


from src.llm.groq_client import get_llm,select_model
from src.graph.state import NarrativeState
from langchain_core.messages import HumanMessage,SystemMessage
import json


def revision_agent_node(state: NarrativeState) -> NarrativeState:
    # previous_chapter_summary = state.get("previous_chapter_summary")
    # prev_summary = previous_chapter_summary[-1] if previous_chapter_summary else 'This is first chapter. '
    
    
    
    metadata = state.get('metadata', {})
    genre = metadata.get('genre', 'fantasy')
    draft_current = state.get('draft')
    revision_count = state.get('revision_count',0)
    chapter_number = state.get("chapter_number")
    user_direction = state.get('user_direction')
    
    
    if not draft_current:
        return state
    
    
    system = """
        You are a strict literary editor.

        Your job:
        - Evaluate quality numerically.
        - Identify weaknesses precisely.
        - Do NOT rewrite the chapter.
        - Do NOT add new story content.
        - Be concise and critical.
        - Be conservative in scoring (most drafts fall between 5-7).
        - Output ONLY valid JSON.
        """
        
    user = f"""
        CHAPTER NUMBER: {chapter_number}
        GENRE: {genre}

        USER DIRECTION:
        {user_direction}

        REVISION COUNT: {revision_count}

        --- CHAPTER DRAFT START ---
        {draft_current}
        --- CHAPTER DRAFT END ---

        Evaluate using these dimensions (0-10 scale):
        - pacing
        - character_depth
        - prose_clarity
        - tension
        - prompt_adherence

        Scoring rules:
        0-3  = weak / broken
        4-6  = average / flawed
        7-8  = strong
        9-10 = exceptional

        Return ONLY valid JSON in this format:

        {{
        "quality_metrics": {{
            "pacing": number,
            "character_depth": number,
            "prose_clarity": number,
            "tension": number,
            "prompt_adherence": number
        }},
        "quality_feedback": [
            "Bullet point critique 1",
            "Bullet point critique 2",
            "Bullet point critique 3"
        ]
        }}
        """
    llm = get_llm(
        select_model("analysis"),
        temp=0.2,
        max_tokens=1000
    )   

    
    messages = [SystemMessage(content=system), HumanMessage(content=user)]
    response = llm.invoke(messages)
  
  
    try:
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
        parsed = json.loads(content)
    except Exception:
        #TODO:Handle using Fallback
        parsed = {}
        
    state["quality_metrics"] = parsed.get("quality_metrics", {})
    state["quality_feedback"] = parsed.get("quality_feedback", [])
    
    print("revision node working")
    
    metrics = state.get('quality_metrics')
    
    
    if metrics:
        avg_score = sum(float(v) for v in  metrics.values())/len(metrics)
        state['quality_score'] = avg_score
    else:
        avg_score = 0.0
        
    
    
    
    max_revisions = state.get("max_revisions", 2)

    threshold = state.get("quality_threshold", 7.5)
    state["should_revise"] = (
        avg_score < threshold and 
        revision_count < max_revisions
    )

        
    return state

        



