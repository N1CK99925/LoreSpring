from src.agents.BaseAgent import BaseAgent
from utils.file_io import load_yaml_config 
from utils.logger import logger
from src.models.llm_interface import LLMClient
from memory.Memory_Manager import MemoryManager
class PlannerAgent(BaseAgent):
    def __init__(self):
        config = load_yaml_config("agent_config.yaml")["agents"]["planner_agent"]
        super().__init__(
            "planner_agent",
            llm = LLMClient(),
            memory = MemoryManager(),
            config = config
            )
        logger.info(f"Initalized Planner Agent")
        self.memory : MemoryManager # type hint for vs code

    def process_task(self):
        """
        Plans the story arc by taking last n chapters, 
        relaed threads and related chractar arc and lore
        and create 
        """
        story_state  = self.memory.story_state.state
        chapter_num = self.memory.story_state.get_next_chapter()
        
        
        recent_chapters = self.memory.retrieve_relevant_narrative(
            query="recent chapter summary",
            filters={'type':'chapter'}
        )
    
        lore_rules= load_yaml_config("lore_rules.yaml")
        
    
        user_prompt = f"""
        Story State:
        {story_state}
        
        Active plot Threads:
        {story_state.get("active_plot_threads",[])}
        
        Character State:
        {story_state.get("character_states")}
        World Rules:
        {lore_rules}
        
        Recent Chapters:
        {recent_chapters}
        
        Next Chapter:
        {chapter_num}
                
        Generate The Chapter Plan
        """
    
        plan = self._generate(
            prompt = user_prompt,
            json_mode = True
        )
        
        if plan is None:
            raise ValueError('Agent Planner failed to produce a plan')
        
        logger.info(f"Planner Agent Failed to plan {plan.get('chapter_number')}")
        
        
        return plan
        