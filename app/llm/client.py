from langchain_litellm import ChatLiteLLMRouter
import asyncio
import logging
from litellm.router import Router
from app.config.settings import settings

logger = logging.getLogger(__name__)

LLM_TIMEOUT = 60


async def invoke_with_timeout(coro, timeout: float = LLM_TIMEOUT, label: str = "llm"):
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        logger.error(f"{label} timed out after {timeout}s")
        raise TimeoutError(f"{label} did not respond within {timeout}s")


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
        # CREATIVE
        {
            "model_name": "creative",
            "litellm_params": {
                "model": "groq/openai/gpt-oss-120b",
                "api_key": settings.groq_api_key,
                "order": 1,
                "request_timeout": LLM_TIMEOUT,
            },
        },
        {
            "model_name": "creative",
            "litellm_params": {
                "model": "gemini/gemini-3.6-flash",
                "api_key": settings.gemini_api_key,
                "order": 2,
                "request_timeout": LLM_TIMEOUT,
            },
        },
        {
            "model_name": "creative",
            "litellm_params": {
                "model": "mistral/mistral-small-2603",
                "api_key": settings.mistral_api_key,
                "order": 3,
                "request_timeout": LLM_TIMEOUT,
            },
        },
        {
            "model_name": "creative",
            "litellm_params": {
                "model": "nvidia_nim/deepseek-ai/deepseek-v4-pro-0813",
                "api_key": settings.nvidia_api_key,
                "order": 4,
                "request_timeout": LLM_TIMEOUT,
            },
        },
        # ANALYSIS
        {
            "model_name": "analysis",
            "litellm_params": {
                "model": "groq/openai/gpt-oss-120b",
                "api_key": settings.groq_api_key,
                "order": 1,
                "request_timeout": LLM_TIMEOUT,
            },
        },
        {
            "model_name": "analysis",
            "litellm_params": {
                "model": "gemini/gemini-3.6-flash",
                "api_key": settings.gemini_api_key,
                "order": 2,
                "request_timeout": LLM_TIMEOUT,
            },
        },
        {
            "model_name": "analysis",
            "litellm_params": {
                "model": "mistral/mistral-small-2603",
                "api_key": settings.mistral_api_key,
                "order": 3,
                "request_timeout": LLM_TIMEOUT,
            },
        },
        {
            "model_name": "analysis",
            "litellm_params": {
                "model": "nvidia_nim/deepseek-ai/deepseek-v4-flash-0731",
                "api_key": settings.nvidia_api_key,
                "order": 4,
                "request_timeout": LLM_TIMEOUT,
            },
        },
        # EXTRACTION
        {
            "model_name": "extraction",
            "litellm_params": {
                "model": "groq/openai/gpt-oss-20b",
                "api_key": settings.groq_api_key,
                "order": 1,
                "request_timeout": LLM_TIMEOUT,
            },
        },
        {
            "model_name": "extraction",
            "litellm_params": {
                "model": "gemini/gemini-3.6-flash",
                "api_key": settings.gemini_api_key,
                "order": 2,
                "request_timeout": LLM_TIMEOUT,
            },
        },
        {
            "model_name": "extraction",
            "litellm_params": {
                "model": "mistral/mistral-small-2603",
                "api_key": settings.mistral_api_key,
                "order": 3,
                "request_timeout": LLM_TIMEOUT,
            },
        },
        {
            "model_name": "extraction",
            "litellm_params": {
                "model": "nvidia_nim/deepseek-ai/deepseek-v4-pro-0813",
                "api_key": settings.nvidia_api_key,
                "order": 4,
                "request_timeout": LLM_TIMEOUT,
            },
        },
    ],
    num_retries=2,
    retry_after=1,
    timeout=LLM_TIMEOUT,
)
