from fastapi import APIRouter, Depends, Request, HTTPException
from api.auth.dependencies import get_current_user
from neo4j.exceptions import AuthError, ServiceUnavailable

router = APIRouter()


def get_graph_service(request: Request):
    return request.app.state.graph_service


@router.get("/graph")
async def get_graph(
    project_id: str,
    user=Depends(get_current_user),
    graph_service=Depends(get_graph_service),
):
    # `graph_service.get_graph_data` is async when using Neo4j; await it
    try:
        data = await graph_service.get_graph_data(user.id, project_id)
        return data
    except AuthError as e:
        raise HTTPException(status_code=401, detail=f"Neo4j authentication failed: {e}")
    except ServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=f"Neo4j service unavailable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch graph: {e}")


@router.get("/debug/neo4j")
async def debug_neo4j(graph_service=Depends(get_graph_service)):
    """Simple endpoint to test Neo4j connectivity and credentials."""
    try:
        result = await graph_service.test_connection()
        return {"source": "neo4j", "status": result}
    except AuthError as e:
        raise HTTPException(status_code=401, detail=f"Neo4j auth error: {e}")
    except ServiceUnavailable as e:
        raise HTTPException(status_code=503, detail=f"Neo4j unavailable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Neo4j test failed: {e}")
