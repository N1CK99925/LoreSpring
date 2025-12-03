import networkx as nx
from utils.file_io import load_yaml_config
from utils.logger import logger
import os
import json

class GraphMemory:
    def __init__ (self, config_file: str = "../config/memory_config.yaml"):
        self.config = load_yaml_config(config_file)
        graph_memory_config = self.config['graph_memory']
        if  graph_memory_config['enabled']:
            self.graph = nx.MultiDiGraph()
            logger.info("Initialized Graph Memory")
        else:
            logger.error("Graph Memry disabled")
            raise ValueError("Graph Memory disabled")
        
    def add_node(self, node_id, node_type, **attributes):
        if node_type not in self.config['graph_memory']['node_types']:
            logger.error(f"Invalid node type: {node_type}")
            raise ValueError(f"Invalid node type: {node_type}")
        self.graph.add_node(node_id, type=node_type , **attributes)
        
    def add_relationship(self, from_node, to_node, relationship_type, **attributes):
        if relationship_type not in self.config['graph_memory']['relationship_types']:
            logger.error(f"Invalid relationship type: {relationship_type}")
            raise ValueError(f"Invalid relationship type: {relationship_type}")
        self.graph.add_edge(from_node, to_node, type=relationship_type , **attributes)
        
    def get_relationships(self, node_id, rel_type=None):
        if node_id not in self.graph:
            logger.error(f"Node {node_id} not found")
            raise ValueError(f"Node {node_id} not found")

        results = []
        for neighbor in self.graph.neighbors(node_id):
            for _, _, data in self.graph.edges(node_id, neighbor, data=True):
                if rel_type and data["type"] != rel_type:
                    continue
                results.append({
                    "target": neighbor,
                    "relationship": data["type"],
                    "metadata": {k: v for k, v in data.items() if k != "type"}
                })

        return results
        
    def get_node_context(self, node_id):
        if node_id not in self.graph:
            logger.error(f"Node {node_id} not found in graph")
            raise ValueError(f"Node {node_id} not found in graph")
        context = {}
        for neighbor in self.graph.neighbors(node_id):
            edges = self.graph.get_edge_data(node_id, neighbor)
            context[neighbor] = edges
        return context
    
    def find_nodes(self, node_type):
        logger.info(f"Finding nodes of type {node_type}")
        return [n for n, data in self.graph.nodes(data=True)
                if data.get("type") == node_type]

    def find_edges(self, relationship_type):
        logger.info(f"Finding edges of type {relationship_type}")
        return [(u, v) for u, v, data in self.graph.edges(data=True)
                if data.get("type") == relationship_type]
        
        
    def save(self, path="../data/memory/graph_memory.json"):
        logger.info("saving the node")
        data = nx.node_link_data(self.graph)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    def load(self, path="../data/memory/graph_memory.json"):
        if not os.path.exists(path):
            return
        logger.info("loading the graph memory from file")
        with open(path, "r") as f:
            data = json.load(f)
            self.graph = nx.node_link_graph(data)
