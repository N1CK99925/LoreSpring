import google.generativeai as genai
from src.utils.file_io import load_yaml_config
from typing import List
import os
from dotenv import load_dotenv
from src.utils.logger import logger
from sentence_transformers import SentenceTransformer  
# TODO: need to add tenacity
load_dotenv('.env')

class Embeddings:
    def __init__(self, config_file: str = "system_config.yaml"):
        self.config = load_yaml_config(config_file)
        embedding_config = self.config['embeddings']
        self.provider = embedding_config['provider']
        self.model = embedding_config['model']
        
        
        
        if self.provider.lower() == 'gemini':
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("Google API key not found in .env file")
            genai.configure(api_key=api_key)
            
            logger.info(f"Initialized Gemini Embeddings with model {self.model}")
        
        elif self.provider.lower() == 'sentence_transformers':
            self.client = SentenceTransformer(self.model)
            logger.info(f"Initialized SentenceTransformers Embeddings with model {self.model}")
            
        else:
            logger.error(f"Unsupported Embedding provider: {self.provider}")
            raise ValueError(f"Unsupported Embedding provider: {self.provider}")
        
    def embed(self, text: str) -> List[float]:
        """
        Generate embeddings for the given text
        """
        if self.provider == 'sentence_transformers':
            response = self.client.encode(text).tolist()
            return response
        
        elif self.provider == 'gemini':
            response = genai.embed_content(
                model=self.model,
                content=text
                
            )
            return response['embedding']
        
    def embed_batch(self, chunks: List[str]) -> List[List[float]]:
        """
        Embed a list of chunks
        """
        if self.provider == 'sentence_transformers':
            return self.client.encode(chunks).tolist()
        
        return [self.embed(chunk) for chunk in chunks]
    
    
    
        
