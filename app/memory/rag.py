import asyncio
import os
from lightrag import LightRAG, QueryParam
from lightrag.base import DocStatus
from lightrag.llm.openai import openai_complete_if_cache
from lightrag.utils import EmbeddingFunc
from lightrag.kg.shared_storage import initialize_pipeline_status
from app.config.settings import settings
from app.memory.embedding import embed_func
from lightrag.kg import *


async def groq_llm_func(
    prompt, system_prompt=None, history_messages=None, **kwargs
) -> str:
    if "response_format" in kwargs:
        kwargs["response_format"] = {"type": "json_object"}
    return await openai_complete_if_cache(
        "openai/gpt-oss-120b",
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

    rag = LightRAG(
        # added max  async cuz groq rate limit with 4 weorkerrs
        llm_model_max_async=2,
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
) -> bool:
    """Index a chapter into the project's lore graph.

    Returns True only when LightRAG confirms the document finished processing
    (no pending/failed docs left in this workspace). Callers must not assume
    success — the insert pipeline can fail asynchronously (e.g. embedding API
    rate limits) without raising.
    """
    rag = await get_project_rag(user_id, project_id)
    await rag.ainsert(f"Chapter {chapter_number}:\n{draft}")
    return await _pipeline_succeeded(rag)


async def _pipeline_succeeded(rag: LightRAG) -> bool:
    """True only if the workspace has no failed or still-pending documents."""
    try:
        counts = await rag.doc_status.get_status_counts()
    except Exception:
        return False
    return (
        counts.get(DocStatus.FAILED.value, 0) == 0
        and counts.get(DocStatus.PENDING.value, 0) == 0
    )


_NO_CONTEXT_MARKERS = ("[no-context]", "not able to provide an answer")


def _is_no_context_result(result: str) -> bool:
    """LightRAG returns an apology string when the graph is empty.

    These results must never be fed to the writer as canon.
    """
    if not result or not result.strip():
        return True
    lowered = result.lower()
    return any(marker in lowered for marker in _NO_CONTEXT_MARKERS)


async def query_lore(
    user_id: int, project_id: str, query: str, mode: str = "hybrid"
) -> str:
    rag = await get_project_rag(user_id, project_id)
    result = await rag.aquery(query, param=QueryParam(mode=mode))
    if result is None:
        return ""
    if _is_no_context_result(str(result)):
        return ""
    return str(result)


def cleanup_project_rag(user_id: int, project_id: str):

    key = (user_id, project_id)
    _rag_cache.pop(key, None)
    _rag_locks.pop(key, None)
    print(f"RAG cache cleared for user {user_id}, project {project_id}")


async def delete_project_rag(user_id: int, project_id: str):
    cleanup_project_rag(user_id, project_id)
