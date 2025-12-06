from vector_store import VectorStore
from utils.file_io import load_yaml_config
from utils.logger import logger
class MemoryManager:
    def __init__(self, vector_store= None):
        self.vector  = vector_store or VectorStore()
        
        
    def store_narrative(self, text:str , metadata: dict):
        return self.vector.add(text=text, metadata=metadata, memory_id=None)
    
    
    def get_narrative(self, query: str , filters = None , n = 5):
        results = self.vector.search(query=query, filters=filters)
        return results[:n]
    