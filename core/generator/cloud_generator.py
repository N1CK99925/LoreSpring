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
        
    def generate(self, prompt: str, max_tokens=8192, temperature=0.9, top_p=0.95, enhance_for_length=True):
        try:
            # Optionally enhance prompt to encourage longer, detailed output
            if enhance_for_length:
                enhanced_prompt = f"""{prompt}

=== WEBNOVEL CHAPTER INSTRUCTIONS ===

Write a complete 1000-1500-word chapter following these rules:

STYLE (RoyalRoad/WuxiaWorld standard):
- Short paragraphs (2-4 sentences) for mobile reading
- Fast-paced, engaging narrative flow
- Close third-person or first-person POV
- Show emotions through actions, not exposition

MUST INCLUDE:
- Strong opening hook
- Frequent internal monologue revealing character thoughts
- 40-50% dialogue mixed with action beats
- Sensory details that immerse the reader
- Chapter-ending hook or cliffhanger

AVOID:
- Purple prose or overly literary language
- Info-dumping or wall-of-text exposition
- Rushing through important scenes
- Summarizing instead of showing

Write the FULL chapter now - expand scenes completely, don't compress."""
            else:
                enhanced_prompt = prompt

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=enhanced_prompt,
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
                    generated_text = "".join(
                        [getattr(part, "text", "") for part in parts if getattr(part, "text", None)]
                    )
                    
                
                    word_count = len(generated_text.split())
                    print(f"Generated {word_count} words")
                    
                    return generated_text

           
            print("No valid text in response. Raw response:")
            print(response)
            return "(No valid text returned. Possibly filtered or truncated by Gemini.)"

        except Exception as e:
            print(f"Error generating content: {e}")
            return ""
