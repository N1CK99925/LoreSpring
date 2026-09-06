from langchain_litellm import ChatLiteLLMRouter
from litellm.router import Router
from app.config.settings import settings


def get_llm(
    model_name: str,
    temp: float = 0.7,
    max_tokens: int = 3000,
):
    return ChatLiteLLMRouter(
        router=router,
        model_name=model_name,
        temperature=temp,
        max_tokens=max_tokens,
    )


router = Router(
    model_list=[
        # ───── creative ─────
        {
            "model_name": "creative",
            "litellm_params": {
                "model": "groq/llama-3.3-70b-versatile",
                "api_key": settings.groq_api_key_1,
                "order": 1,
            },
        },
        {
            "model_name": "creative",
            "litellm_params": {
                "model": "openai/gpt-5-mini",
                "api_key": settings.openai_api_key,
                "order": 2,
            },
        },
        # ───── analysis ─────
        {
            "model_name": "analysis",
            "litellm_params": {
                "model": "groq/llama-3.3-70b-versatile",
                "api_key": settings.groq_api_key_1,
                "order": 1,
            },
        },
        {
            "model_name": "analysis",
            "litellm_params": {
                "model": "openai/gpt-5-mini",
                "api_key": settings.openai_api_key,
                "order": 2,
            },
        },
        # ───── extraction ─────
        {
            "model_name": "extraction",
            "litellm_params": {
                "model": "groq/llama-3.1-8b-instant",
                "api_key": settings.groq_api_key_1,
                "order": 1,
            },
        },
        {
            "model_name": "extraction",
            "litellm_params": {
                "model": "openai/gpt-5-mini",
                "api_key": settings.openai_api_key,
                "order": 2,
            },
        },
    ]
)
