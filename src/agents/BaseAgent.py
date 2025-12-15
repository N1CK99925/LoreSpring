from abc import ABC, abstractmethod
from utils.logger import logger
from utils.file_io import load_prompt_file , load_yaml_config

class BaseAgent(ABC):
    def __init__(self, agent_name: str, llm, memory, config: dict):
        """
        Base class for all agents.
      
        """
        self.agent_name = agent_name
        self.llm = llm
        self.memory = memory
        self.config = config
        self.system_prompt = load_prompt_file(f"{agent_name}.txt")
        

        logger.info(f"Initialized BaseAgent: {self.agent_name}")

    @abstractmethod
    def process_task(self, *args, **kwargs):
        """Every agent implements its own task logic."""
        pass

    def _generate(self, prompt: str, json_mode: bool = False):
        """Unified LLM call wrapper."""
        logger.info(f"Agent {self.agent_name} generating response for prompt.")
        logger.debug(f"Prompt injected for {self.agent_name} system_prompt")
        return self.llm.generate(
            user_prompt=prompt,
            system_prompt=self.system_prompt,
            json_mode=json_mode
            
        )

    def _retrieve_context(self, query: str, filters=None, n=5):
        """Unified memory retrieval helper."""
        logger.info(f"Agent {self.agent_name} retrieving context for query: {query}")
        return self.memory.retrieve_relevant_context(
            query=query,
            filters=filters,
            n=n
        )
