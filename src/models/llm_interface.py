from google import genai
import dotenv

from google.generativeai import types




dotenv.load_dotenv()
api_key = dotenv.get_key('.env','GEMENI_API_KEY')
client = genai.Client(api_key = api_key)
"""
main llm class that controls all the agents
"""
class LLMClient:
    def __init(self,model_name,provider,api_key):
        self.client = genai.Client()
        self.mode_name = model_name
        self.api_key = api_key
        self.provider = provider
    
    def generate(self, prompt: str , max_tokens , temprature , top_p):
                