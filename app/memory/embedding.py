import asyncio

import numpy as np
import httpx

from app.config.settings import settings

JINA_API_URL = "https://api.jina.ai/v1/embeddings"

# Retry policy for transient provider failures (rate limits, 5xx, network blips)
_MAX_ATTEMPTS = 4
_BASE_RETRY_DELAY_S = 1.0
_RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}

_client: httpx.AsyncClient | None = None


def get_client() -> httpx.AsyncClient:
    global _client

    if _client is None:
        _client = httpx.AsyncClient(
            timeout=60.0,
            headers={
                "Authorization": f"Bearer {settings.jina_api_key}",
                "Content-Type": "application/json",
            },
        )

    return _client


async def _post_with_retry(client: httpx.AsyncClient, payload: dict) -> httpx.Response:
    """POST to the embedding API with exponential backoff on transient errors."""
    last_response: httpx.Response | None = None

    for attempt in range(_MAX_ATTEMPTS):
        try:
            response = await client.post(JINA_API_URL, json=payload)
            if response.status_code not in _RETRYABLE_STATUS_CODES:
                return response
            last_response = response
        except httpx.TransportError:
            if attempt == _MAX_ATTEMPTS - 1:
                raise

        if attempt < _MAX_ATTEMPTS - 1:
            await asyncio.sleep(_BASE_RETRY_DELAY_S * (2**attempt))

    # Exhausted all attempts with retryable status codes
    assert last_response is not None
    last_response.raise_for_status()
    return last_response


async def embed_func(texts: list[str]) -> np.ndarray:
    client = get_client()

    response = await _post_with_retry(
        client,
        {
            "model": "jina-embeddings-v3",
            "task": "retrieval.passage",
            "input": texts,
        },
    )

    response.raise_for_status()

    embeddings = [
        item["embedding"]
        for item in sorted(response.json()["data"], key=lambda x: x["index"])
    ]

    return np.asarray(embeddings, dtype=np.float32)
