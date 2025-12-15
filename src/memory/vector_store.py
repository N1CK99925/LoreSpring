import chromadb
from utils.file_io import load_yaml_config
from src.models.embeddings import Embeddings
from utils.logger import logger
from typing import Optional, Dict
import uuid
class VectorStore:
    """
    When agent generates new memeory it will be embedded thru embbedings.ppy 
    then be store in the vector db. CHromadb will save it in form of chapter
    scene entnties etc and metadata
    when another agent needs context , it will perform semantic search by embedding the query
    and returns the closest past memory
    
    
    
    """
    def __init__ (self, config_file: str = "../config/memory_config.yaml"):
        self.config = load_yaml_config(config_file)
        vector_store_config = self.config['vector_memory']
        self.provider = vector_store_config['provider']
        self.results = vector_store_config.get('n_results',5)
        
        if self.provider.lower() == 'chromadb':
            self.client = chromadb.PersistentClient(path="../data/vector_db")
            self.collection = self.client.get_or_create_collection(
                name='narrative_memory', 
                metadata={"hnsw:space":"cosine"},
                embedding_function=None,
               
                
                
                )
            self.embedder = Embeddings(config_file=self.config.get("system_config_file","../config/system_config.yaml"))
          
            logger.info("Initialized ChromaDB Vector Store")
            
        else: 
            logger.info(f"Initialized Vector Store with provider {self.provider}")
            raise ValueError(f"Unsupported Vector Store provider: {self.provider}")
    
    def add(self,text : str , metadata : dict , memory_id : str):
        memory_id = memory_id or str(uuid.uuid4())
        
        embedding = self.embedder.embed(text)
        embedding = list(embedding)
        
        try:
            self.collection.add(
                embeddings=[embedding],
                documents=[text],
                metadatas=[metadata],
                ids=[memory_id],
            )
        except Exception:
            
            if hasattr(self.collection, "upsert"):
                self.collection.upsert(
                    embeddings=[embedding],
                    documents=[text],
                    metadatas=[metadata],
                    ids=[memory_id],
                )
        

        return memory_id
       

        
    def search(self, query: str ,filter: Optional[Dict] = None) -> list:
        query_embedding = self.embedder.embed(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=self.results,
            where=filter
        )
        return [
        {
                "text": doc,
                "metadata": meta,
                "id": id_,
                "distance": dist
            }
            for doc, meta, id_, dist in zip(
                results['documents'][0],
                results['metadatas'][0],
                results['ids'][0],
                results['distances'][0]
            )
        ]
        
        
        
        
        