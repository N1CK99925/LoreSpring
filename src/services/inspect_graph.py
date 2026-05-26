import networkx as nx

G = nx.read_graphml(
    "./lore_db/graph_chunk_entity_relation.graphml"
)

print("NoDES ")

for node_id , data in G.nodes(data=True):
    print(node_id)
    print(data)
    print("-----")
    
print("EDGES")


for u, v, data in G.edges(data=True):
    print(f"{u} -> {v}")
    print(data)
    print("-----")