from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List, Optional, Union
from src.utils.logger import logger


class Chunker:
    def __init__(
        self, 
        chunk_size: int = 800, 
        chunk_overlap: int = 100, 
        separators: Optional[List[str]] = None,
        length_function: callable = len
    ):
        """
        Creates chunks from text using RecursiveCharacterTextSplitter.
        Compatible with LangChain Document format for LangGraph RAG pipelines.
        
        Args:
            chunk_size: Maximum size of each chunk
            chunk_overlap: Number of characters to overlap between chunks
            separators: List of separators to try (in order)
            length_function: Function to measure text length (default: len)
        """
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=separators if separators else ['\n\n', '\n', '.', ' ', ''],
            length_function=length_function
        )
        logger.info(f"Initialized Chunker with chunk_size={chunk_size}, overlap={chunk_overlap}")
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into string chunks.
        
        Args:
            text: Input text to split
            
        Returns:
            List of text chunks
        """
        if not isinstance(text, str):
            logger.error("Input text must be a string")
            raise ValueError("Input text must be a string")
        
        if not text.strip():
            logger.warning("Empty text provided to chunk_text")
            return []
        
        chunks = self.text_splitter.split_text(text)
        logger.debug(f"Split text into {len(chunks)} chunks")
        return chunks
    
    def chunk_documents( self, documents: Union[List[str], List[Document]]) -> List[Document]:
        """
        Split documents into chunks, preserving metadata.
        Returns LangChain Document objects for LangGraph compatibility.
        
        Args:
            documents: List of strings or LangChain Documents
            
        Returns:
            List of LangChain Document chunks with metadata
        """
        if documents and isinstance(documents[0], str):
            documents = [Document(page_content=doc) for doc in documents]
        
        if not documents:
            logger.warning("Empty document list provided")
            return []
        
        try:
            chunks = self.text_splitter.split_documents(documents)
            logger.info(f"Split {len(documents)} documents into {len(chunks)} chunks")
            return chunks
        except Exception as e:
            logger.error(f"Error chunking documents: {e}")
            raise
    
    def chunk_text_with_metadata(self, text: str, metadata: Optional[dict] = None ) -> List[Document]:
        """
        Chunk text and return as Documents with metadata.
        Useful for maintaining source information in RAG pipelines.
        
        Args:
            text: Text to chunk
            metadata: Optional metadata to attach to all chunks
            
        Returns:
            List of Document objects with chunks and metadata
        """
        chunks = self.chunk_text(text)
        return [
            Document(
                page_content=chunk, 
                metadata=metadata or {}
            ) 
            for chunk in chunks
        ]