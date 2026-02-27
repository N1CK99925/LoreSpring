import os
# TODO: delete graph memory and rebuild in mid function
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import openai_complete_if_cache
from lightrag.utils import EmbeddingFunc
from lightrag.kg.shared_storage import initialize_pipeline_status
from config.settings import settings
from src.memory.embedding import embed_func

async def groq_llm_func(
    prompt,
    system_prompt=None,
    history_messages=[],
    **kwargs
) -> str:
    if "response_format" in kwargs:
        kwargs["response_format"] = {"type": "json_object"}
    return await openai_complete_if_cache(
        "meta-llama/llama-4-scout-17b-16e-instruct",
        prompt,
        system_prompt=system_prompt,
        history_messages=history_messages,
        api_key=settings.groq_api_key,
        base_url="https://api.groq.com/openai/v1",
        **kwargs
    )




async def initialize_rag(working_dir: str = "./lore_db") -> LightRAG:
    os.makedirs(working_dir, exist_ok=True)
    
    rag = LightRAG(
        working_dir=working_dir,
        llm_model_func=groq_llm_func,
        chunk_token_size=400,
        embedding_func=EmbeddingFunc(
            embedding_dim=384, 
            max_token_size=512,
            
            func=embed_func
        )
    )
    
    await rag.initialize_storages()
    await initialize_pipeline_status()
    return rag


_rag_instance = None

async def get_rag() -> LightRAG:
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = await initialize_rag()
    return _rag_instance

async def insert_chapter(draft: str, chapter_number: int):
    rag = await get_rag()
    await rag.ainsert(f"Chapter {chapter_number}:\n{draft}")
    print(f"lore memory: chapter {chapter_number} inserted")

async def query_lore(query: str, mode: str = "hybrid") -> str:
    rag = await get_rag()
    return await rag.aquery(query, param=QueryParam(mode=mode))

def visualize_graph(working_dir: str = "./lore_db"):
    import networkx as nx
    from pyvis.network import Network
    
    G = nx.read_graphml(f"{working_dir}/graph_chunk_entity_relation.graphml")
    net = Network(height="100vh", notebook=False)
    net.from_nx(G)
    net.show("lore_graph.html")
    print("graph saved to lore_graph.html")
