from src.agents.BaseAgent import BaseAgent
from src.utils.file_io import load_yaml_config 
from src.utils.logger import logger
from src.models.llm_interface import LLMClient

class PlannerAgent(BaseAgent):
    def __init__(self, memory):
        config = load_yaml_config("agent_config.yaml")["agents"]["planner_agent"]
        super().__init__(
            "planner_agent",
            llm = LLMClient(),
            memory = memory,
            config = config
            )
        logger.info(f"Initalized Planner Agent")
        

    def process_task(self):
        """
        Plans the story arc by taking last n chapters, 
        relaed threads and related chractar arc and lore
        and create 
        """
        story_state  = self.memory.story_state
        next_chapter = story_state.get_next_chapter()
        
        start = max(1, next_chapter - 3)
        end = next_chapter - 1

        query = f"chapters {start} to {end}"

        recent_chapters = self.memory.retrieve_relevant_narrative(
            query=f"{query}",
            filters={'type':'narrative'},
            n=3
        )

       
        lore_rules= load_yaml_config("lore_rules.yaml")
        
    
        user_prompt = f"""
        Story State:
        {story_state}
        
        Active plot Threads:
        {story_state.state.get("active_plot_threads",[])}
        
        Character State:
        {story_state.state.get("character_states")}
        World Rules:
        {lore_rules}
        
        Recent Chapters:
        {recent_chapters}
        
        Next Chapter:
        {next_chapter}
                
        Generate The Chapter Plan
        """
    
        plan = self._generate(
            prompt = user_prompt,
            json_mode = True
        )
        
        if plan is None:
            logger.info(f"Planner Agent Failed to plan")
            raise ValueError('Agent Planner failed to produce a plan')
        
        
        
        return plan
        