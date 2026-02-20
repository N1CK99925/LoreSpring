from src.llm.groq_client import get_llm,select_model
from src.graph.state import NarrativeState
from langchain_core.messages import HumanMessage,SystemMessage
import json




def continue_agent_node(state: NarrativeState) -> NarrativeState:
    draft = state.get("draft")
    previous_chapter_summary = state.get('previous_chapter_summary',[])
    
    
   
    
    
    system = """
    You are a narrative continuity validation engine.

    Your task:
    - Compare the CURRENT DRAFT against the ESTABLISHED STORY MEMORY.
    - Detect factual contradictions.
    - Detect character inconsistencies.
    - Detect timeline conflicts.
    - Detect object/item continuity errors.
    - Detect location logic violations.
      Detect ONLY DIRECT contradictions.


    Important rules:
    - Do NOT rewrite the story.
    - Do NOT evaluate prose quality.
    - Do NOT suggest improvements.
    - Only report factual or logical continuity issues.
    
    CRITICAL RULES:

    - Missing details are NOT contradictions.
    - New information is allowed unless it directly conflicts with established facts.
    - A scene evolving or expanding is NOT a contradiction.
    - Only flag issues when BOTH statements cannot be true simultaneously.
    
    
    Severity rules:

    HIGH:
    - Impossible timeline
    - Dead character alive
    - Object changes identity

    MEDIUM:
    - Strong logical conflict

    LOW:
    - Possible interpretation differences



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
    print("conitunity node running")
    
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
    
    
    issues = state.get("continuity_issues", [])

    critical = [
    i for i in issues
    if i.get("severity") in ["high", "medium"]
]

    state["should_revise"] = len(critical) > 0
    state['continuity_feedback'] = critical
    
    print("continuity issues:", issues)
    print("force revise:", state["should_revise"])


    
    
    
    return state
    