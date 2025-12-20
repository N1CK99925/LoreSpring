from src.agents.PlannerAgent import PlannerAgent
from src.agents.NarrativeAgent import NarrativeAgent
from src.agents.ConsistancyAgent import ConsistencyAgent
from src.agents.LoreKeeperAgent import LoreKeeperAgent
from src.agents.Evolution_Agent import EvolutionAgent
from src.utils.logger import logger
from src.memory.Memory_Manager import MemoryManager
class AgentCoordinator:
    
    def __init__(self):
        self.writer = NarrativeAgent()
        self.planner = PlannerAgent()
        self.critic = ConsistencyAgent()
        self.memory = MemoryManager()
        logger.info("Agent Coordinator Initalized")
        
        
    def run_cycle(self):
        plan = self.planner.process_task()
        if not plan:
            logger.error("Cycle : Plannner Failed to generate Plan")
            return None
        
        draft = self.writer.process_task(plan=plan)
        if not draft or 'scene_text' not in draft:
            logger.error("Cycle :Writer Failed the task")
            return None
        
        self.memory.store_narrative(
            chapter_num=plan.get('chapter_num'),
            text=draft.get('scene_text'),
            metadata=draft.get('metadata',{})    
        )
        self.memory.story_state.mark_chapter_complete(
            chapter_num=plan.get('chapter_number')
        )
        
        logger.info(f"Successfully completed Chapter {plan.get('chapter_number')}.")
        return draft.get('scene_text')
        
        