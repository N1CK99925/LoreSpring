import asyncio
import os
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import openai_complete_if_cache
from lightrag.utils import EmbeddingFunc
from lightrag.kg.shared_storage import initialize_pipeline_status
from config.settings import settings
from src.memory.embedding import embed_func
from lightrag.kg import *


async def groq_llm_func(
    prompt, system_prompt=None, history_messages=None, **kwargs
) -> str:
    if "response_format" in kwargs:
        kwargs["response_format"] = {"type": "json_object"}
    return await openai_complete_if_cache(
        "meta-llama/llama-4-scout-17b-16e-instruct",
        prompt,
        system_prompt=system_prompt,
        history_messages=history_messages or [],
        api_key=settings.groq_api_key,
        base_url="https://api.groq.com/openai/v1",
        **kwargs,
    )


async def initialize_rag(user_id: int, project_id: str) -> LightRAG:

    pg_config = settings.get_postgres_config()
    for key, value in pg_config.items():
        os.environ[key] = value

    os.environ["LIGHTRAG_KV_STORAGE"] = "PGKVStorage"
    os.environ["LIGHTRAG_GRAPH_STORAGE"] = "PGGraphStorage"
    os.environ["LIGHTRAG_VECTOR_STORAGE"] = "PGVectorStorage"
    os.environ["LIGHTRAG_DOC_STATUS_STORAGE"] = "PGDocStatusStorage"

    rag = LightRAG(
        working_dir="./lore_db",
        llm_model_func=groq_llm_func,
        chunk_token_size=400,
        chunk_overlap_token_size=50,
        embedding_func=EmbeddingFunc(
            embedding_dim=1024, max_token_size=8192, func=embed_func
        ),
        graph_storage="Neo4JStorage",
        vector_storage="PGVectorStorage",
        doc_status_storage="PGDocStatusStorage",
        kv_storage="PGKVStorage",
        workspace=f"{user_id}:{project_id}",
    )

    await rag.initialize_storages()
    await initialize_pipeline_status()
    return rag


_rag_cache: dict[tuple[int, str], LightRAG] = {}
_rag_locks: dict[tuple[int, str], asyncio.Lock] = {}


async def get_project_rag(user_id: int, project_id: str) -> LightRAG:
    key = (user_id, project_id)

    if key in _rag_cache:
        return _rag_cache[key]

    if key not in _rag_locks:
        _rag_locks[key] = asyncio.Lock()

    async with _rag_locks[key]:
        if key in _rag_cache:
            return _rag_cache[key]

        rag_instance = await initialize_rag(user_id, project_id)
        _rag_cache[key] = rag_instance

        print(f"RAG initialized for user {user_id}, project {project_id}")
        return rag_instance


async def insert_chapter(
    user_id: int, project_id: str, draft: str, chapter_number: int
):
    rag = await get_project_rag(user_id, project_id)
    await rag.ainsert(f"Chapter {chapter_number}:\n{draft}")
    print(
        f"lore memory: user {user_id}, project {project_id}, chapter {chapter_number} inserted"
    )


async def query_lore(
    user_id: int, project_id: str, query: str, mode: str = "hybrid"
) -> str:
    rag = await get_project_rag(user_id, project_id)
    return await rag.aquery(query, param=QueryParam(mode=mode))


def cleanup_project_rag(user_id: int, project_id: str):

    key = (user_id, project_id)
    _rag_cache.pop(key, None)
    _rag_locks.pop(key, None)
    print(f"RAG cache cleared for user {user_id}, project {project_id}")


async def delete_project_rag(user_id: int, project_id: str):
    cleanup_project_rag(user_id, project_id)
