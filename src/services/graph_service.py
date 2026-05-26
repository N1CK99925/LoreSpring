import networkx as nx
import os
from pathlib import Path

class GraphService:

    def __init__(self, working_dir="./lore_db"):
        self.working_dir = working_dir

    def load_graph(self, user_id=None, project_id=None):
        """Load graph for specific user and project, or return empty graph if not found"""
        
        # Build the correct path if user and project are provided
        if user_id and project_id:
            graph_path = Path(self.working_dir) / str(user_id) / project_id / "graph_chunk_entity_relation.graphml"
        else:
            # Fallback to old path (or you could raise an error)
            graph_path = Path(self.working_dir) / "graph_chunk_entity_relation.graphml"
        
        # Create directory if it doesn't exist
        graph_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Return empty graph if file doesn't exist
        if not graph_path.exists():
            print(f"Graph file not found at {graph_path}, returning empty graph")
            return nx.Graph()
        
        try:
            return nx.read_graphml(graph_path)
        except Exception as e:
            print(f"Error loading graph from {graph_path}: {e}")
            return nx.Graph()

    def build_nodes(self, G):
        nodes = []
        
        for node_id, data in G.nodes(data=True):
            node = {
                "id": node_id,
                "label": node_id,
                "type": data.get("entity_type", "unknown"),
                "attributes": {
                    k: v for k, v in data.items()
                }
            }
            nodes.append(node)
        
        return nodes

    def build_links(self, G):
        links = []
        
        for source, target, data in G.edges(data=True):
            link = {
                "source": source,
                "target": target,
                "label": data.get("description", ""),
                "type": data.get("keywords", ""),
                "attributes": {
                    k: v for k, v in data.items()
                }
            }
            links.append(link)
        
        return links

    def get_graph_data(self, user_id=None, project_id=None):
        G = self.load_graph(user_id, project_id)
        
        nodes = self.build_nodes(G)
        links = self.build_links(G)
        
        return {
            "nodes": nodes,
            "links": links
        }