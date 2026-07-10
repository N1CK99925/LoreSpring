from neo4j import AsyncDriver, AsyncSession, Query
import os
from neo4j.exceptions import AuthError, ServiceUnavailable


class GraphService:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI")
        self.user = os.getenv("NEO4J_USERNAME", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = None

    async def connect(self):
        """Initialize Neo4j driver"""
        from neo4j import AsyncGraphDatabase

        self.driver = AsyncGraphDatabase.driver(
            self.uri, auth=(self.user, self.password)
        )

    async def close(self):
        """Close driver"""
        if self.driver:
            await self.driver.close()

    # used in the '/debug/neo4j' route to test the connection in `graph_viz.py` file (me)
    async def test_connection(self):
        """Run a minimal query to verify the Neo4j connection."""
        if not self.driver:
            await self.connect()
        try:
            async with self.driver.session() as session:
                rec = await session.run("RETURN 1 AS ok")
                r = await rec.single()
                return {"ok": True, "result": r["ok"]}
        except AuthError:
            # propagate for route to map to 401
            raise
        except ServiceUnavailable:
            # propagate for route to map to 503
            raise
        except Exception as e:
            return {"ok": False, "error": str(e)}

    async def get_graph_data(self, user_id: int, project_id: str):
        """Query nodes and edges from Neo4j"""
        workspace_label = f"{user_id}:{project_id}"
        try:
            async with self.driver.session() as session:
                # Get all nodes - no workspace filter for now
                nodes_result = await session.run(
                    Query(
                        f"""
                    MATCH (n:`{workspace_label}`)
                    RETURN n
                    LIMIT 200
                    """
                    )
                )
                nodes = []
                async for record in nodes_result:
                    node = record["n"]
                    node_dict = dict(node)

                    # Extract displayable label
                    label = (
                        node_dict.get("entity_id")
                        or node_dict.get("name")
                        or node_dict.get("label")
                        or str(node.element_id)[:20]
                    )

                    nodes.append(
                        {
                            "id": str(node.element_id),
                            "label": str(label),
                            "type": str(node_dict.get("entity_type", "unknown")),
                            "attributes": node_dict,
                        }
                    )

                    # Get all relationships
                    edges_result = await session.run(
                        Query(
                            f"""
                        MATCH (a:`{workspace_label}`)-[r]->(b:`{workspace_label}`)
                        RETURN a, r, b
                        LIMIT 200
                        """
                        )
                    )
                links = []
                async for record in edges_result:
                    links.append(
                        {
                            "source": str(record["a"].element_id),
                            "target": str(record["b"].element_id),
                            "label": str(dict(record["r"]).get("description", "")),
                            "attributes": dict(record["r"]),
                        }
                    )
                # TODO: add indexing to the workspace_id
                return {"nodes": nodes, "links": links}
        except Exception as e:
            print(f"Graph query error: {e}")
            return {"nodes": [], "links": [], "error": str(e)}
