from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.embeddings import Embeddings as BaseEmbeddings
from src.utils.file_io import load_yaml_config
from typing import List
import os
from dotenv import load_dotenv
from src.utils.logger import logger
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv('.env')


class Embeddings:
    def __init__(self, config_file: str = "system_config.yaml"):
        self.config = load_yaml_config(config_file)
        embedding_config = self.config['embeddings']
        self.provider = embedding_config['provider']
        self.model = embedding_config['model']
        
        self.client: BaseEmbeddings = self._initialize_client()
        logger.info(f"Initialized {self.provider} Embeddings with model {self.model}")
    
    def _initialize_client(self) -> BaseEmbeddings:
        """Initialize the appropriate LangChain embeddings client"""
        if self.provider.lower() == 'gemini':
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("Google API key not found in .env file")
            return GoogleGenerativeAIEmbeddings(
                model=self.model,
                google_api_key=api_key
            )
        
        elif self.provider.lower() == 'sentence_transformers':
            return HuggingFaceEmbeddings(
                model_name=self.model,
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
        
        else:
            raise ValueError(f"Unsupported Embedding provider: {self.provider}")
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def embed(self, text: str) -> List[float]:
        """
        Generate embeddings for single text.
        Uses LangChain's embed_query method (optimized for single queries)
        """
        try:
            return self.client.embed_query(text)
        except Exception as e:
            logger.error(f"Embedding error for text: {e}")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Embed multiple texts efficiently.
        Uses LangChain's embed_documents method (batched for efficiency)
        """
        if not texts:
            logger.warning("Empty text list provided to embed_batch")
            return []
        
        try:
            return self.client.embed_documents(texts)
        except Exception as e:
            logger.error(f"Batch embedding error: {e}")
            raise