from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Optional
from src.utils.logger import logger

class Chunker:
    def __init__ (self, chunk_size: int = 800, chunk_overlap: int = 100, separators: Optional[List[str]] = None):
        """
        This class creates chunks from text into smaller bits ussing RecursiveCharacterTextSplitter
        
        
        """
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size = chunk_size,
            chunk_overlap = chunk_overlap,
            separators = separators if separators else ['\n\n', '\n', ' ']
        
            
        )
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split the text into chunks
        """
        if not isinstance(text, str):
            logger.error("Input text must be a string")
            raise ValueError("Input text must be a string")
        
        return self.text_splitter.split_text(text)
    
    def chunk_documents(self, documents: List[str]) -> List[str]:
        """
        Split a list of documents into chunks
        """
        all_chunks = []
        for doc in documents:
            
            chunks = self.chunk_text(doc)
            all_chunks.extend(chunks)
        
        
        return all_chunks
    
    