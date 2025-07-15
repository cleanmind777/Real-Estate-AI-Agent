import json
from pymilvus import MilvusClient
from openai_utils import get_embedding
from milvus_setup import connect_milvus, ensure_collection

def load_data(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data

def insert_data_to_milvus(client, collection_name, data):
    vectors = []
    ids = []
    for item in data:
        embedding = get_embedding(item['description'])
        vectors.append(embedding)
        ids.append(item['id'])
    client.insert(collection_name=collection_name, records=vectors, ids=ids)

if __name__ == "__main__":
    client = connect_milvus()
    collection_name = "real_estate"
    dimension = 1536  # Embedding dimension for text-embedding-ada-002
    ensure_collection(client, collection_name, dimension)
    data = load_data("../data/real_estate_data.json")
    insert_data_to_milvus(client, collection_name, data)