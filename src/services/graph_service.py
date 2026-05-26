import networkx as nx

class GraphService:

    def __init__(self, working_dir="./lore_db"):
        self.working_dir = working_dir

    def load_graph(self):
        return nx.read_graphml(
            f"{self.working_dir}/graph_chunk_entity_relation.graphml"
        )

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

    def get_graph_data(self):

        G = self.load_graph()

        nodes = self.build_nodes(G)

        links = self.build_links(G)

        return {
            "nodes": nodes,
            "links": links
        }