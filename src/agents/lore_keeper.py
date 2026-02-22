from src.llm.groq_client import get_llm
from src.graph.state import NarrativeState
from src.schemas.lore import LoreFacts,LoreResult

def lore_keeper(state: NarrativeState) -> NarrativeState:
    lore_facts = state.get('lore_context',[])
    draft = state.get('draft')
     
    