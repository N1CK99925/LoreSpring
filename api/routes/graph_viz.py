from fastapi import APIRouter
from src.services.graph_service import GraphService


router = APIRouter(tags=["Graph Visualization"])
graph_service = GraphService()
@router.get("/graph")
async def get_graph():
    return graph_service.get_graph_data()



