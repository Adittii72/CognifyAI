import os
from dotenv import load_dotenv
import google.generativeai as genai
from typing import List
import numpy as np
from simple_storage import store_embedding, get_embeddings, get_content

# Load environment variables
load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
genai.configure(api_key=api_key)

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks"""
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
    
    return chunks

async def get_embedding(text: str) -> List[float]:
    """Get embedding for text using Gemini"""
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content=text
        )
        return result['embedding']
    except Exception as e:
        # Fallback: create a simple hash-based embedding
        import hashlib
        hash_obj = hashlib.sha256(text.encode())
        hash_bytes = hash_obj.digest()
        # Convert to list of floats (normalized)
        embedding = [float(b) / 255.0 for b in hash_bytes[:768]]
        # Pad to 768 dimensions if needed
        while len(embedding) < 768:
            embedding.append(0.0)
        return embedding[:768]

async def store_embeddings(content_id: str, text: str):
    """Chunk text and store embeddings in memory"""
    chunks = chunk_text(text)
    
    for chunk in chunks:
        embedding = await get_embedding(chunk)
        store_embedding(content_id, chunk, embedding)

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    a_arr = np.array(a)
    b_arr = np.array(b)
    return np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr))

async def search_similar(content_id: str, query: str, limit: int = 5) -> List[str]:
    """Search for similar chunks using vector similarity"""
    query_embedding = await get_embedding(query)
    
    # Get all embeddings for this content
    all_embeddings = get_embeddings(content_id)
    
    if not all_embeddings:
        return []
    
    # Calculate similarities
    similarities = []
    for emb in all_embeddings:
        similarity = cosine_similarity(query_embedding, emb['embedding'])
        similarities.append((similarity, emb['chunk_text']))
    
    # Sort by similarity and return top results
    similarities.sort(reverse=True, key=lambda x: x[0])
    return [text for _, text in similarities[:limit]]

async def get_content_text(content_id: str) -> str:
    """Retrieve full content text"""
    content = get_content(content_id)
    return content['raw_text'] if content else ""
