import BaseAgent
from utils.file_io import load_yaml_config , load_prompt_file
from utils.logger import logger
from models.llm_interface import LLMClient
from memory.Memory_Manager import MemoryManager
class LoreKeeperAgent(BaseAgent):
    def __init__(self):
        super.__init__(
            "lore_extraction",
            llm = LLMClient(),
            memory = MemoryManager()
            )
        logger.info(f"Initalized Planner Agent")