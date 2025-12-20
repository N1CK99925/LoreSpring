from src.memory.vector_store import VectorStore
from src.memory.Story_State import StoryState
from src.models.chunking import Chunker
from utils.logger import logger
import uuid

class MemoryManager:
    def __init__(self, vector_store=None):
        try:
            self.vector = VectorStore()
            self.story_state = StoryState()
            self.chunker = Chunker(chunk_size=800, chunk_overlap=100)
        except Exception as e:
            logger.error(f"Failed to initialize Memory Manager: {e}")
            raise
    
    def store_narrative(self, chapter_num: int, text: str, metadata: dict):
        """
        Store chapter with chunking for better retrieval.
        """
        logger.info(f"Storing chapter {chapter_num} narrative")
        
        
        chunks = self.chunker.chunk_text(text)
        
        
        chunk_ids = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = {
                **metadata,
                "chapter": chapter_num,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "type": "narrative"
            }
            chunk_id = f"ch{chapter_num:03d}_chunk{i:02d}"
            self.vector.add(text=chunk, metadata=chunk_metadata, memory_id=chunk_id)
            chunk_ids.append(chunk_id)
        
        logger.info(f"Stored {len(chunks)} chunks for chapter {chapter_num}")
        return chunk_ids
    
    def retrieve_relevant_narrative(self, query: str, filters=None, n=None):
        """
        Retrieve relevant context with proper structure.
        Returns list of dict with text + metadata.
        """
       
        n = n or self.vector.results
        
        results = self.vector.search(query=query, filter=filters)
        
        if not results:
            logger.warning("No relevant context found for query")
            return []
        
       
        return results[:n]
    
    def get_state(self):
        """Get current story state dict."""
        return self.story_state.state
    
    def get_story_state(self):
        """Get StoryState object."""
        return self.story_state