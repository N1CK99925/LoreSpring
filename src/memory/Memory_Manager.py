from vector_store import VectorStore
from utils.file_io import load_yaml_config
from utils.logger import logger
from memory.Story_State import StoryState
class MemoryManager:
    def __init__(self, vector_store= None):
        try:
            self.vector  = VectorStore()
            self.story_state = StoryState()
        except:
            self.vector = vector_store
            logger.error("Failed to initialize Vector Store in Memory Manager")
        
        
    def store_narrative(self, text:str , metadata: dict):
        logger.info("Storing narrative in memory")
        return self.vector.add(text=text, metadata=metadata, memory_id=None)
    
    
    def get_narrative(self, query: str , filters = None , n = 5):
        results = self.vector.search(query=query, filters=filters)
        logger.info(f"Retrieved {len(results)} narratives from memory")
        return results[:n]
    