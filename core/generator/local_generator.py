from core.generator.base_generator import BaseModelGenerator
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
"""
implementation of local models
"""

MODELS = {
    "Qwen": "Qwen/Qwen2.5-1.5B-Instruct",
    "mistral": "mistralai/Mistral-3B-Instruct-v0.1",
    "phi3": "microsoft/phi-3-mini-3.8b-instruct",
}

max_tokens = 1000
temprature = 0.7
top_p = 0.9

class LocalGenerator(BaseModelGenerator):
    def __init__(self, model_name="Qwen"):
        model_path = MODELS.get(model_name, MODELS["Qwen"])
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading model {model_path} on {device}")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="auto" if device == "cuda" else None,
        ).to(device)
        self.device = device
        self.model_name = model_name
        
    def generate(self, prompt: str, max_tokens=max_tokens, temperature=temprature, top_p=top_p, enhance_for_length=True):
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
            
            # Format for instruction-following models
            formatted_prompt = self._format_prompt(enhanced_prompt)
            
            inputs = self.tokenizer(formatted_prompt, return_tensors="pt").to(self.device)
            
            output = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                repetition_penalty=1.2,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            generated_text = self.tokenizer.decode(output[0], skip_special_tokens=True)
            
            # Remove the prompt from output (some models include it)
            if generated_text.startswith(formatted_prompt):
                generated_text = generated_text[len(formatted_prompt):].strip()
            
            word_count = len(generated_text.split())
            print(f"Generated {word_count} words")
            
            return generated_text
            
        except Exception as e:
            print(f"Error generating content: {e}")
            return ""
    
    def _format_prompt(self, prompt: str) -> str:
        """Format prompt according to model's instruction template"""
        
        # Qwen format
        if "Qwen" in self.model_name or "qwen" in self.model_name.lower():
            return f"<|im_start|>system\nYou are a helpful assistant that writes engaging webnovel chapters.<|im_end|>\n<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n"
        
        # Mistral format (simple)
        elif "mistral" in self.model_name.lower():
            return f"[INST] {prompt} [/INST]"
        
        # Phi-3 format
        elif "phi" in self.model_name.lower():
            return f"<|user|>\n{prompt}<|end|>\n<|assistant|>\n"
        
        # Default: return as-is
        return prompt