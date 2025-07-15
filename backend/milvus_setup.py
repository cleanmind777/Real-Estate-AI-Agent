from pymilvus import MilvusClient

def connect_milvus():
    client = MilvusClient("milvus_demo.db")
    return client

def ensure_collection(client, collection_name, dimension):
    if not client.has_collection(collection_name):
        client.create_collection(
            collection_name=collection_name,
            dimension=dimension
        )

def insert_vectors(client, collection_name, vectors, ids):
    client.insert(collection_name=collection_name, records=vectors, ids=ids)

def search_vectors(client, collection_name, query_vector, top_k=5):
    results = client.search(
        collection_name=collection_name,
        data=[query_vector],
        limit=top_k,
        output_fields=["*"]
    )
    return results