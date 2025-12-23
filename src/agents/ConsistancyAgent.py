from src.agents.BaseAgent import BaseAgent
from src.memory.Memory_Manager import MemoryManager
from src.models.llm_interface import LLMClient
from src.utils.file_io import load_yaml_config
from src.utils.logger import logger

class ConsistencyAgent(BaseAgent):
    def __init__(self, memory):
        config = load_yaml_config("agent_config.yaml")["agents"]["consistency_agent"]
        super().__init__(
            "consistency_agent",
            llm = LLMClient(),
            memory = MemoryManager(),
            config = config
            )
        logger.info(f"Initalized Planner Agent")
        self.memory : MemoryManager
    def process_task(self, draft_text: str, plan: dict):
        """Review draft against memory and lore rules."""
        lore_rules = load_yaml_config("lore_rules.yaml")
        story_state = self.memory.get_state()
        
        user_prompt = f"""
        Draft Text: {draft_text}
        Story Plan: {plan}
        Lore Rules: {lore_rules}
        Characters: {story_state.get('character_states')}
        """
        
       
        return self._generate(prompt=user_prompt, json_mode=True)