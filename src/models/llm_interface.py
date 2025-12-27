from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from src.utils.logger import logger
from src.utils.file_io import load_yaml_config
import os

try:
    load_dotenv('.env')
    logger.info('env loaded successfully')
except Exception as e:
    logger.error(".env error")
class LLM_Interface:
    def __init__(self, config_file : str = "system_config.yaml"):
        self.config = load_yaml_config(config_file)
        llm_config = self.config['llm']
        self.provider = llm_config.get('provider')
        self.model = llm_config.get('model')
        self.temperature = llm_config.get('temperature')
        self.max_tokens = llm_config.get('max_tokens')
        
        
        if self.provider == 'groq':
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("No Groq API Key Found in .env")
            self.client = ChatGroq(
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                api_key=api_key
            )
            
        elif self.provider == 'gemini': 
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError( 'No Gemini API key found in .env')
            self.client = ChatGoogleGenerativeAI(
                model = self.model,
                temperature = self.temperature,
                api_key = api_key,
                max_tokens = self.max_tokens
            )
        
        
        
    def generate( self, messages):
        """
        wrapper for langraph
        
        
        """
        return self.client.invoke(messages)
        