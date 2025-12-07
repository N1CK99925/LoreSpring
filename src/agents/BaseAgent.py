from abc import ABC, abstractmethod
from utils.logger import logger

class BaseAgent(ABC):
    def __init__(self, agent_name: str, llm, memory, config: dict):
        """
        Base class for all agents.
      
        """
        self.agent_name = agent_name
        self.llm = llm
        self.memory = memory
        self.config = config

        logger.info(f"Initialized BaseAgent: {self.agent_name}")

    @abstractmethod
    def process_task(self, *args, **kwargs):
        """Every agent implements its own task logic."""
        pass

    def _generate(self, prompt: str, system_prompt: str = None, json_mode: bool = False):
        """Unified LLM call wrapper."""
        return self.llm.generate(
            user_prompt=prompt,
            system_prompt=system_prompt,
            json_mode=json_mode
        )

    def _retrieve_context(self, query: str, filters=None, n=5):
        """Unified memory retrieval helper."""
        return self.memory.retrieve_relevant_context(
            query=query,
            filters=filters,
            n=n
        )
