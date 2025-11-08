from core.generator.base_generator import BaseModelGenerator
from google import genai
from google.genai import types
import dotenv

dotenv.load_dotenv()
api_key = dotenv.get_key('.env', 'GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

class CloudGenerator(BaseModelGenerator):
    def __init__(self, model_name="gemini-2.5-flash"):
        """
        Initialize Gemini API client
        
        Args:
            model_name: Gemini model to use 
                       Options: "gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash", "gemini-1.5-pro"
        """
        print(f"Initializing Gemini model: {model_name}")
        self.client = genai.Client()  
        self.model_name = model_name
        
    def generate(self, prompt: str, max_tokens=1024, temperature=0.9, top_p=0.95):
        """
        Generate text using Gemini API
        
        Args:
            prompt: Input text prompt
            max_tokens: Maximum number of tokens to generate
            temperature: Sampling temperature (0.0-2.0)
            top_p: Nucleus sampling parameter
            
        Returns:
            Generated text as string
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                    top_p=top_p,
                    top_k=40, 
                )
            )
            if hasattr(response, "candidates") and response.candidates:
                candidate = response.candidates[0]
                if getattr(candidate, "content", None) and getattr(candidate.content, "parts", None):
                 parts = candidate.content.parts
                return "".join(
                    [getattr(part, "text", "") for part in parts if getattr(part, "text", None)]
                )

        # If response failed or empty, print debug info
            print("No valid text in response. Raw response:")
            print(response)
            return "(No valid text returned. Possibly filtered or truncated by Gemini.)"

        except Exception as e:
         print(f"Error generating content: {e}")
        return ""
        
        
