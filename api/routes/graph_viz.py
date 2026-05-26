from fastapi import APIRouter, Depends
from database.session import get_database
from src.services.graph_service import GraphService
from api.auth.dependencies import get_current_user
from database.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
router = APIRouter(tags=["Graph Visualization"])
graph_service = GraphService()

@router.get("/graph")
async def get_graph(project_id: str, user_id: User = Depends(get_current_user), db : AsyncSession = Depends(get_database)):
    
    return graph_service.get_graph_data(user_id.id, project_id)



