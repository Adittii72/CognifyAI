from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from services.youtube_service import process_youtube_video
from services.pdf_service import process_pdf_document
from services.ai_service import generate_flashcards, generate_quiz, chat_with_content
from services.vector_service import store_embeddings, search_similar
from database import init_db

load_dotenv()

app = FastAPI(title="AI Learning Assistant API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    try:
        init_db()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("The app will start but database operations may fail.")

# Models
class VideoRequest(BaseModel):
    url: str

class ContentRequest(BaseModel):
    content_ids: List[str]

class ChatRequest(BaseModel):
    content_ids: List[str]
    message: str
    history: List[dict] = []

# Endpoints
@app.get("/")
async def root():
    return {"message": "AI Learning Assistant API"}

@app.post("/process-video")
async def process_video(request: VideoRequest):
    try:
        content_id, text = await process_youtube_video(request.url)
        await store_embeddings(content_id, text)
        return {"content_id": content_id, "message": "Video processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    try:
        content_id, text = await process_pdf_document(file)
        await store_embeddings(content_id, text)
        return {"content_id": content_id, "message": "PDF processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-flashcards")
async def create_flashcards(request: ContentRequest):
    try:
        flashcards = await generate_flashcards(request.content_ids)
        return {"flashcards": flashcards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-quiz")
async def create_quiz(request: ContentRequest):
    try:
        questions = await generate_quiz(request.content_ids)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        return StreamingResponse(
            chat_with_content(request.content_ids, request.message, request.history),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
