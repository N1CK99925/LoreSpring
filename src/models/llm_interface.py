

from dotenv import load_dotenv

from utils.file_io import load_yaml_config
from typing import Optional
import google.generativeai as genai
import os


from utils.logger import logger
logger.info("Logger initalized, The system has started")

load_dotenv('.env')
#  TODO: need to add a retry logic here (tenacity or something)


class LLMClient:
    def __init__ (self,config_file : str = "../config/system_config.yaml"):
        self.config = load_yaml_config(config_file)
        llm_config = self.config['llm']
        self.provider = llm_config['provider']
        self.model = llm_config['model']
        self.temperature = llm_config.get('temperature',0.7)
        self.max_tokens = llm_config.get('max_tokens',1024)
        
        if self.provider.lower() == 'gemini':
            
            api_key = os.getenv("GOOGLE_API_KEY")
           
            if not api_key:
                logger.error("Google API key not found in .env file")
                raise ValueError("Google API key not found in .env file")
            genai.configure(api_key=api_key)
            self.client = genai.GenerativeModel(self.model)
            logger.info(f"Initialized Gemini LLM Client with model {self.model}")
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
        
        
        
    def generate(self, user_prompt: str ,system_prompt: Optional[str] = None) -> Optional[str]:
        """
        This is the unified file that will the agents will use to interact with the LLM
        
        user Prompt = current task + previous chapter or whatever
        systen prompt = agent rules and identity
        """
        messages = []
        try:
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})

            messages.append({"role": "user", "content": user_prompt})
               
            response = self.client.generate_content(
                messages=messages,
                temperature =  self.temperature,
                max_output_tokens =  self.max_tokens,
                
                
            )
            logger.info("Text generation successful")
            return response.text

        except Exception as e:
            logger.error(f"Error generating text: {e}")
            return None
        

    
                