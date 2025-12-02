from google import generativeai
from utils.file_io import load_yaml_config
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv('.env')

class Embeddings:
    def __init__(self, config_file: str = "../config/system_config.yaml"):
        self.config = load_yaml_config(config_file)
        embedding_config = self.config['embeddings']
        self.provider = embedding_config['provider']
        self.model = embedding_config['model']
        self.dim = 768
        
        if self.provider.lower() == 'gemini':
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("Google API key not found in .env file")
            generativeai.configure(api_key=api_key)
            self.client = generativeai.EmbeddingModel(self.model)
        else:
            raise ValueError(f"Unsupported Embedding provider: {self.provider}")
        
    def embed(self, text: str) -> List[float]:
        """
        Generate embeddings for the given text
        """
        response = self.client.generate_embeddings(
            model=self.model,
            input=text
        )
        return response.embeddings
    def embed_batch(self, chunks: List[str]) -> List[List[float]]:
        """
        Embed  a list of chunks
        """
        return [self.embed(chunk) for chunk in chunks]
    
    
        