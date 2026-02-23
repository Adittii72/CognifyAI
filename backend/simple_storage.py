"""
Simple in-memory storage for testing without database
"""
from typing import Dict, List
import json

# In-memory storage
contents_store: Dict[str, dict] = {}
embeddings_store: Dict[str, List[dict]] = {}
chat_history_store: Dict[str, List[dict]] = {}

def store_content(content_id: str, content_type: str, raw_text: str):
    """Store content in memory"""
    contents_store[content_id] = {
        'id': content_id,
        'content_type': content_type,
        'raw_text': raw_text
    }

def get_content(content_id: str) -> dict:
    """Get content from memory"""
    return contents_store.get(content_id)

def store_embedding(content_id: str, chunk_text: str, embedding: List[float]):
    """Store embedding in memory"""
    if content_id not in embeddings_store:
        embeddings_store[content_id] = []
    
    embeddings_store[content_id].append({
        'chunk_text': chunk_text,
        'embedding': embedding
    })

def get_embeddings(content_id: str) -> List[dict]:
    """Get all embeddings for content"""
    return embeddings_store.get(content_id, [])

def store_chat_message(content_id: str, role: str, message: str):
    """Store chat message in memory"""
    if content_id not in chat_history_store:
        chat_history_store[content_id] = []
    
    chat_history_store[content_id].append({
        'role': role,
        'message': message
    })

def get_chat_history(content_id: str) -> List[dict]:
    """Get chat history for content"""
    return chat_history_store.get(content_id, [])

def clear_all():
    """Clear all stored data"""
    contents_store.clear()
    embeddings_store.clear()
    chat_history_store.clear()
