from src.agents.BaseAgent import BaseAgent
from src.utils import logger
from memory.Memory_Manager import MemoryManager
from models.llm_interface import LLMClient
from utils.file_io import load_yaml_config
from typing import Dict
class NarrativeAgent(BaseAgent):
    def __init__ (self):
        config = load_yaml_config('agent_config.yaml')['agents']['narrative_agent']
        
        super().__init__(
            "narrative_agent",
            llm=LLMClient(),
            memory=MemoryManager(),
            config=config
            )
        logger.info("Initialized NarrativeAgent")

    def process_task(self, plan : Dict):
        """
        Narrative Agnet's Base task
        """

        
    
    
    