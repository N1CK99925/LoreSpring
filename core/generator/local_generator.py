from core.generator.base_generator import BaseModelGenerator
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
"""
implementattion of local models

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
    def __init__(self,model_name = "Qwen"):
        model_name = MODELS.get(model_name,MODELS["Qwen"])
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading model {model_name} on {device}")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="auto" if device == "cuda" else None,
            
        ).to(device)
        self.device = device
    def generate(self,prompt : str ,max_tokens = max_tokens,temperature = temprature, top_p = top_p):
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
        output = self.model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            repetition_penalty=1.2,
            do_sample = True
        )
        return self.tokenizer.decode(output[0], skip_special_tokens=True)
    
        
        
