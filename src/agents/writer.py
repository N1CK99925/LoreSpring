from src.llm.groq_client import get_llm, select_model
from src.graph.state import NarrativeState
from langchain_core.messages import SystemMessage, HumanMessage

def writer_agent_node(state: NarrativeState) -> NarrativeState:
    
    previous_chapters = state.get('previous_chapters', [])
    prev_summary = previous_chapters[-1] if previous_chapters else 'This is the first chapter.'
    
    metadata = state.get('metadata', {})
    genre = metadata.get('genre', 'fantasy')
    
   
    system = f"""You are an expert narrative writer specializing in {genre} fiction.

Your task: Write Chapter {state['chapter_number']} of an ongoing narrative.

LORE CONTEXT (if available):
Characters: {state.get('lore_context', {}).get('characters', 'None provided')}
Recent Events: {state.get('lore_context', {}).get('events', 'None provided')}

STYLE GUIDELINES:
- Length: 800-1200 words (test version)
- Third person limited, past tense
- Show don't tell, use sensory details

CRITICAL: Maintain consistency with any provided context."""

    user = f"""Previous Chapter Summary:
{prev_summary}

User Direction: {state['user_direction']}

Write Chapter {state['chapter_number']} now. Begin directly with the narrative."""

    # LLM call
    llm = get_llm(select_model("creative_writing"), temp=0.7, max_tokens=2000)
    
    messages = [SystemMessage(content=system), HumanMessage(content=user)]
    response = llm.invoke(messages)
    
    # Update state (these create the keys if missing)
    state["draft"] = response.content
    state["revision_count"] = 0
    
    return state
