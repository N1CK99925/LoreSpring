from src.agents import BaseAgent
from utils.file_io import load_yaml_config , load_prompt_file
from utils.logger import logger
from src.models.llm_interface import LLMClient
from memory.Memory_Manager import MemoryManager
class PlannerAgent(BaseAgent):
    def __init__(self):
        config = load_yaml_config("../config/agent_config.yaml")["agents"]["planner_agent"]
        super().__init__(
            "planner_agent",
            llm = LLMClient(),
            memory = MemoryManager(),
            config = config
            )
        logger.info(f"Initalized Planner Agent")
        
    
    
    
    
    
    
        
    def process_task(self, ):
        """
        Plans the story arc by taking last n chapters, 
        relaed threads and related chractar arc and lore
        and create 
        """
        
    
        