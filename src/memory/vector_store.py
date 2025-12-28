from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.vectorstores import VectorStore as BaseVectorStore
from src.utils.file_io import load_yaml_config, MEMORY_DIR
from src.models.embeddings import Embeddings
from src.utils.logger import logger
from typing import Optional, Dict, List
import uuid
from tenacity import retry, stop_after_attempt, wait_exponential


class VectorStore:
    def __init__(self, config_file: str = "memory_config.yaml"):
        self.config = load_yaml_config(config_file)
        vector_store_config = self.config['vector_memory']
        self.provider = vector_store_config['provider']
        self.n_results = vector_store_config.get('n_results', 5)
        
        if self.provider.lower() != 'chromadb':
            raise ValueError(f"Unsupported Vector Store provider: {self.provider}")
        
        self.embedder = Embeddings()
        
        db_path = MEMORY_DIR / "vector_db"
        db_path.mkdir(parents=True, exist_ok=True)
        
        self.client: BaseVectorStore = Chroma(
            collection_name="narrative_memory",
            embedding_function=self.embedder.client,
            persist_directory=str(db_path),
            collection_metadata={"hnsw:space": "cosine"}
        )
        
        logger.info(f"Initialized ChromaDB Vector Store at {db_path}")
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), reraise=True)
    def add(self, text: str, metadata: Dict, memory_id: Optional[str] = None) -> str:
        """
            text: Memory content to store
            metadata: Metadata about the memory (chapter, scene, entity, etc.)
            memory_id: Optional custom ID (auto-generated if not provided)
        """
        if not text or not text.strip():
            logger.warning("Attempted to add empty text to vector store")
            return None
        
        memory_id = memory_id or str(uuid.uuid4())
        
        try:
            doc = Document(page_content=text, metadata={**metadata, "memory_id": memory_id})
            self.client.add_documents([doc], ids=[memory_id])
            logger.debug(f"Added memory {memory_id} to vector store")
            return memory_id
            
        except Exception as e:
            logger.error(f"Error adding memory to vector store: {e}")
            raise
    
    def add_batch(self, texts: List[str], metadatas: List[Dict], memory_ids: Optional[List[str]] = None) -> List[str]:
        """
        Add multiple memories efficiently in batch.
        
        Args:
            texts: List of memory contents
            metadatas: List of metadata dicts (same length as texts)
            memory_ids: Optional list of custom IDs
            
        Returns:
            List of memory IDs that were added
        """
        if len(texts) != len(metadatas):
            raise ValueError("texts and metadatas must have same length")
        
        if not texts:
            logger.warning("Empty batch provided to add_batch")
            return []
        
        memory_ids = memory_ids or [str(uuid.uuid4()) for _ in texts]
        
        try:
            docs = [
                Document(page_content=text, metadata={**meta, "memory_id": mid})
                for text, meta, mid in zip(texts, metadatas, memory_ids)
            ]
            
            self.client.add_documents(docs, ids=memory_ids)
            logger.info(f"Added {len(memory_ids)} memories to vector store")
            return memory_ids
            
        except Exception as e:
            logger.error(f"Error in batch add: {e}")
            raise
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), reraise=True)
    def search(self, query: str, filter: Optional[Dict] = None, n_results: Optional[int] = None) -> List[Dict]:
        """
        semantic search
        """
        if not query or not query.strip():
            logger.warning("Empty query provided to search")
            return []
        
        n_results = n_results or self.n_results
        
        try:
            results = self.client.similarity_search_with_score(query=query, k=n_results, filter=filter)
            
            formatted_results = [
                {
                    "text": doc.page_content,
                    "metadata": doc.metadata,
                    "id": doc.metadata.get("memory_id", "unknown"),
                    "score": score
                }
                for doc, score in results
            ]
            
            logger.debug(f"Found {len(formatted_results)} results for query")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching vector store: {e}")
            raise
    
    def search_by_metadata(self, filter: Dict, limit: Optional[int] = None) -> List[Dict]:
        """
        
        Metadata filter (e.g., {"chapter": "1", "scene": "opening"})
    
        """
        limit = limit or self.n_results
        
        try:
            results = self.client.get(where=filter, limit=limit)
            
            formatted_results = [
                {"text": doc, "metadata": meta, "id": id_}
                for doc, meta, id_ in zip(results['documents'], results['metadatas'], results['ids'])
            ]
            
            logger.debug(f"Retrieved {len(formatted_results)} memories by metadata")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error retrieving by metadata: {e}")
            raise
    
    def delete(self, memory_ids: List[str]) -> None:
        """
        Delete memories by ID.
        """
        try:
            self.client.delete(ids=memory_ids)
            logger.info(f"Deleted {len(memory_ids)} memories")
        except Exception as e:
            logger.error(f"Error deleting memories: {e}")
            raise
    
    def as_retriever(self, **kwargs):
      
        return self.client.as_retriever(**kwargs)