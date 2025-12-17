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
    
    def retrieve_relevant_narrative(self, query: str, filters=None, n=5):
        """
        Retrieve relevant context for agent prompts.
        This is what agents call via _retrieve_context().
        """
        results = self.vector.search(query=query, filter=filters)
        
        
        if not results:
            return "No relevant context found."
        
        context_parts = []
        for result in results[:n]:
            meta = result.get('metadata', {})
            text = result.get('text', '')
            chapter = meta.get('chapter', '?')
            
            context_parts.append(f"[Chapter {chapter}]\n{text}")
        
        return "\n\n---\n\n".join(context_parts)
    
    def get_state(self):
        """Get current story state dict."""
        return self.story_state.state
    
    def get_story_state(self):
        """Get StoryState object."""
        return self.story_state