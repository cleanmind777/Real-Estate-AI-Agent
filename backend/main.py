from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
import shutil
import io
from milvus_setup import connect_milvus, ensure_collection, search_vectors
from openai_utils import get_embedding, get_chat_response_stream, speech_to_text, text_to_speech
import openai

app = FastAPI()

# Connect to Milvus
client = connect_milvus()
collection_name = "real_estate"
dimension = 1536
ensure_collection(client, collection_name, dimension)

@app.post("/chat_stream")
async def chat_stream(query: str):
    def generate():
        query_embedding = get_embedding(query)
        results = search_vectors(client, collection_name, query_embedding)
        context = ""
        if results and results[0].has_primary_keys:
            top_result = results[0].entities.get_string_field("description")[0]
            context = f"Based on this real estate listing: '{top_result}', "
        full_query = context + query
        response = get_chat_response_stream(full_query)
        for chunk in response:
            content = chunk['choices'][0].get('delta', {}).get('content')
            if content:
                yield content

    return StreamingResponse(generate(), media_type="text/plain")

@app.post("/voice")
async def voice(audio: UploadFile = File(...)):
    audio_path = "temp_audio.wav"
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    text = speech_to_text(audio_path)
    query_embedding = get_embedding(text)
    results = search_vectors(client, collection_name, query_embedding)
    context = ""
    if results and results[0].has_primary_keys:
        top_result = results[0].entities.get_string_field("description")[0]
        context = f"Based on this real estate listing: '{top_result}', "
    full_query = context + text
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": full_query}],
    )
    chat_response = response['choices'][0]['message']['content']
    tts_response = text_to_speech(chat_response)
    return StreamingResponse(io.BytesIO(tts_response.content), media_type="audio/mpeg")