import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {DATABASE_URL}")  # Debug print

def init_db():
    """Initialize database with required tables and extensions"""
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set")
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Enable pgvector extension
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    
    # Create tables
    cur.execute("""
        CREATE TABLE IF NOT EXISTS contents (
            id TEXT PRIMARY KEY,
            content_type TEXT NOT NULL,
            raw_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS embeddings (
            id SERIAL PRIMARY KEY,
            content_id TEXT REFERENCES contents(id),
            chunk_text TEXT NOT NULL,
            embedding vector(768),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id SERIAL PRIMARY KEY,
            content_id TEXT REFERENCES contents(id),
            role TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Create index for vector similarity search
    cur.execute("""
        CREATE INDEX IF NOT EXISTS embeddings_vector_idx 
        ON embeddings USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
    """)
    
    conn.commit()
    cur.close()
    conn.close()

@contextmanager
def get_db():
    """Database connection context manager"""
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()
