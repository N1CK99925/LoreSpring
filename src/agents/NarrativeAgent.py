import BaseAgent
from src.utils import logger
from memory.Memory_Manager import MemoryManager
from models.llm_interface import LLMClient

class NarrativeAgent(BaseAgent):
    def __init__ (self):
        super().__init__(
            "narrative_agent",
            llm=LLMClient(),
            memory=MemoryManager(),
                         )
        logger.info("Initialized NarrativeAgent")
        
    
    def process_task():
        """
        Narrative Agnet's Base task :- 
        
        1.  
        
        
        """
        
        
        pass
    
    
    