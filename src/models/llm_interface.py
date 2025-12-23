from tenacity import retry, stop_after_attempt, wait_fixed
from dotenv import load_dotenv

from src.utils.file_io import load_yaml_config
from typing import Optional
from google import genai
from google.genai import types
import os
import json
import re

from src.utils.logger import logger
logger.info("Logger initialized, The system has started")

load_dotenv('.env')


class LLMClient:
    def __init__(self, config_file: str = "../config/system_config.yaml"):
        self.config = load_yaml_config(config_file)
        llm_config = self.config['llm']
        self.provider = llm_config['provider']
        self.model = llm_config['model']
        self.temperature = llm_config.get('temperature', 0.7)
        self.max_tokens = llm_config.get('max_tokens', 1024)
        self.mock = (self.provider == 'mock')
        
        if self.mock:
            logger.info("Initialized Mock LLM Client")
            self.client = None
            return
        
        if self.provider.lower() == 'groq':
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("Groq API key not found in .env file")
            import groq
            self.client = groq.Client(api_key=api_key)
            logger.info(f"Initialized Groq LLM Client with model {self.model}")
        
        elif self.provider.lower() == 'gemini':
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                logger.error("Google API key not found in .env file")
                raise ValueError("Google API key not found in .env file")
            
            # New SDK initialization
            self.client = genai.Client(api_key=api_key)
            logger.info(f"Initialized Gemini LLM Client with model {self.model}")
        
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    @retry(stop=stop_after_attempt(1), wait=wait_fixed(1), reraise=True)
    def generate(self, user_prompt: str, system_prompt: Optional[str] = None, json_mode: bool = False) -> Optional[str]:
        """
        Unified generate method used by agents.

        Args:
            user_prompt: primary prompt/task for the agent.
            system_prompt: optional system-level instructions (agent identity, rules).
            json_mode: when True, instruct model to respond with strict JSON and attempt to parse.
        """
        if self.mock:
            if json_mode:
                mock_json = {"mock": True, 'text': "mock1 JSON response"}
                logger.info('Returning mock json response')
                return mock_json
            logger.info('Returning mock text response')
            
            return "Normal response from mock LLM"
        
        result_text = None
        
        if self.provider.lower() == 'groq':
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": user_prompt})
            
            logger.debug(f"Sending messages to Groq: {messages}")
            
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=self.temperature,
                    max_completion_tokens=self.max_tokens
                )
                choice = response.choices[0]
                
                content = None
                if hasattr(choice, "message") and hasattr(choice.message, "content"):
                    content = choice.message.content
                elif isinstance(choice, dict) and "message" in choice:
                    content = choice["message"].get("content")
                else:
                    content = getattr(choice, "text", None) or choice.get("text") if isinstance(choice, dict) else None

                result_text = content
                logger.info("LLMClient (groq) generation successful")

            except Exception as e:
                logger.error(f"LLMClient (groq) error: {e}")
                raise
        
        elif self.provider.lower() == 'gemini':
            contents = []
            contents.append(user_prompt)
            
            logger.debug(f"LLMClient (gemini) sending prompt: {user_prompt}")
            if system_prompt:
                logger.debug(f"LLMClient (gemini) system prompt: {system_prompt}")

            try:
               
                config = types.GenerateContentConfig(
                    temperature=self.temperature,
                    max_output_tokens=self.max_tokens,
                    system_instruction=system_prompt if system_prompt else None,
                )
                
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=config
                )

                
                result_text = response.text
                logger.info("LLMClient (gemini) generation successful")

            except Exception as e:
                logger.error(f"LLMClient (gemini) error: {e}")
                raise
        
        if result_text is None:
            logger.error("LLMClient: no text returned from provider")
            raise RuntimeError("No output from LLM provider")
        if json_mode:
            try:
                parsed = json.loads(result_text)
                return parsed
            except json.JSONDecodeError:
                json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
                match = re.search(json_pattern, result_text, re.DOTALL)
                
                if match:
                    try:
                        parsed = json.loads(match.group(1))
                        logger.info("LLMClient: Extracted JSON from markdown code block")
                        return parsed
                    except json.JSONDecodeError:
                        pass
                json_obj_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
                match = re.search(json_obj_pattern, result_text, re.DOTALL)
                
                if match:
                    try:
                        parsed = json.loads(match.group(0))
                        logger.info("LLMClient: Extracted JSON object from text")
                        return parsed
                    except json.JSONDecodeError:
                        pass
                
                logger.error("LLMClient: JSON mode enabled but response was not valid JSON")
                logger.debug(f"LLMClient (raw response): {result_text}")
                return None
        logger.debug(result_text)
        return result_text