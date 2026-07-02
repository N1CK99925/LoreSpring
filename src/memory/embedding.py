import numpy as np
import httpx

from config.settings import settings

JINA_API_URL = "https://api.jina.ai/v1/embeddings"

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


async def embed_func(texts: list[str]) -> np.ndarray:
    client = get_client()

    response = await client.post(
        JINA_API_URL,
        json={
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
