from langchain_groq import ChatGroq

import time
from groq import RateLimitError
from app.config.settings import settings


def get_llm(model: str, temp: float = 0.7, max_tokens: int = 3000):
    return ChatGroq(
        model=model,
        temperature=temp,
        max_tokens=max_tokens,
        api_key=settings.groq_api_key,
    )


def select_model(task: str):
    return {
        "creative_writing": "llama-3.3-70b-versatile",
        # analysis feeds with_structured_output (tool calling) — qwen/qwen3.6-27b
        # fails "Failed to call a function" on Groq; llama-3.3-70b-versatile supports it
        "analysis": "llama-3.3-70b-versatile",
        "extraction": "llama-3.1-8b-instant",
    }.get(task, "llama-3.1-8b-instant")


def invoke_with_retry(llm, messages, max_retries=3):
    for i in range(max_retries):
        try:
            return llm.invoke(messages)
        except RateLimitError:
            time.sleep(2**i)
