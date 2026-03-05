import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

async def embed_func(texts: list[str]) -> np.ndarray:
    return model.encode(texts, convert_to_numpy=True)

class EmbeddingFunc:
    def __init__(
        self,
        embedding_dim: int = 384,
        max_token_size: int = 512,
        func=embed_func,
    ):
        self.embedding_dim = embedding_dim
        self.max_token_size = max_token_size
        self.func = func

    async def __call__(self, texts: list[str]) -> np.ndarray:
        return await self.func(texts)