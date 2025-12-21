from src.agents.BaseAgent import BaseAgent
from src.utils.logger import logger
from src.memory.Memory_Manager import MemoryManager
from src.models.llm_interface import LLMClient
from src.utils.file_io import load_yaml_config
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
        self.memory : MemoryManager

    def process_task(self, plan : Dict):
        """
        Narrative Agnet's Base task
        """
        
        search_query = f"{plan.get('chapter_title')}" + " ".join(plan.get('plot_threads_advanced',[]))
        context = self._retrieve_context(query=search_query,n=5)
        
        user_prompt = f"""
        
        Scene_Plan:
        {plan}
        
        context:
        {context}
        
        story state: {self.memory.get_state()}        
        
        """
        
        result = self._generate(prompt=user_prompt,json_mode=True)
        
        if not result or "scene_text" not in result:
            logger.error("Narrative agent failed to produce scene text")
            return None
            
        return result
        
        
        

        
    
    
    