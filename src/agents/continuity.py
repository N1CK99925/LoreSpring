from src.llm.groq_client import get_llm,select_model
from src.graph.state import NarrativeState
from langchain_core.messages import HumanMessage,SystemMessage
import json

def ContinuityNode(state: NarrativeState) -> NarrativeState:
    draft = state.get("draft")
    previous_chapter_summary = state.get('previous_chapter_summary')
   
    
    
    system = """
    You are a narrative continuity validation engine.

    Your task:
    - Compare the CURRENT DRAFT against the ESTABLISHED STORY MEMORY.
    - Detect factual contradictions.
    - Detect character inconsistencies.
    - Detect timeline conflicts.
    - Detect object/item continuity errors.
    - Detect location logic violations.

    Important rules:
    - Do NOT rewrite the story.
    - Do NOT evaluate prose quality.
    - Do NOT suggest improvements.
    - Only report factual or logical continuity issues.

    If no issues are found, return an empty list.

    Return ONLY valid JSON in this format:

    {
    "continuity_issues": [
        {
        "type": "contradiction | timeline | character | object | location",
        "description": "clear explanation of the issue",
        "severity": "high | medium | low"
        }
    ]
    }
    """
    
    human = f"""
    ESTABLISHED STORY MEMORY:

    {previous_chapter_summary}

    ---

    CURRENT DRAFT:

    {draft}

    Analyze the draft against the established memory.

    Return ONLY valid JSON.
    """


    llm = get_llm(select_model("analysis"), temp = 0.1, max_tokens=1200)
    
    messages = [SystemMessage(content=system), HumanMessage(content=human)]
    response = llm.invoke(messages)
    
    
    try:
     content = response.content.strip()

     if content.startswith("```"):
        content = content.strip("`")
        content = content.replace("json", "", 1).strip()

     start = content.find("{")
     end = content.rfind("}") + 1
     content = content[start:end]

     parsed = json.loads(content)

    except Exception as e:
        print("Continuity parse failed:", e)
        parsed = {}
        
    state["continuity_issues"] = parsed.get("continuity_issues", [])
    
    
    
    
    return state
    