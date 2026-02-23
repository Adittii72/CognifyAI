import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from typing import List, Dict, AsyncGenerator
from services.vector_service import get_content_text, search_similar

# Load environment variables
load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('models/gemini-2.5-flash')

async def generate_flashcards(content_ids: List[str]) -> List[Dict[str, str]]:
    """Generate flashcards from multiple content sources"""
    # Combine all content
    combined_content = ""
    for content_id in content_ids:
        content = await get_content_text(content_id)
        combined_content += content + "\n\n"
    
    # Limit content length for API
    content_preview = combined_content[:4000] if len(combined_content) > 4000 else combined_content
    
    prompt = f"""Based on the following content, generate 10-15 educational flashcards.
Each flashcard should have a 'front' (question/term) and 'back' (answer/definition).

Content:
{content_preview}

Return ONLY a JSON array in this exact format:
[
  {{"front": "Question or term", "back": "Answer or definition"}},
  ...
]"""

    response = model.generate_content(prompt)
    result = response.text
    
    # Parse JSON response
    try:
        # Remove markdown code blocks if present
        if '```json' in result:
            result = result.split('```json')[1].split('```')[0]
        elif '```' in result:
            result = result.split('```')[1].split('```')[0]
        
        flashcards = json.loads(result.strip())
        return flashcards
    except json.JSONDecodeError:
        # Fallback
        return [
            {"front": "Sample Question", "back": "Sample Answer"}
        ]

async def generate_quiz(content_ids: List[str]) -> List[Dict]:
    """Generate quiz questions from multiple content sources"""
    # Combine all content
    combined_content = ""
    for content_id in content_ids:
        content = await get_content_text(content_id)
        combined_content += content + "\n\n"
    
    # Limit content length
    content_preview = combined_content[:4000] if len(combined_content) > 4000 else combined_content
    
    prompt = f"""Based on the following content, generate 5-10 multiple-choice quiz questions.
Each question should have 4 options and indicate the correct answer index (0-3).

Content:
{content_preview}

Return ONLY a JSON array in this exact format:
[
  {{
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0
  }},
  ...
]"""

    response = model.generate_content(prompt)
    result = response.text
    
    # Parse JSON response
    try:
        # Remove markdown code blocks if present
        if '```json' in result:
            result = result.split('```json')[1].split('```')[0]
        elif '```' in result:
            result = result.split('```')[1].split('```')[0]
        
        questions = json.loads(result.strip())
        return questions
    except json.JSONDecodeError:
        return [
            {
                "question": "Sample question?",
                "options": ["A", "B", "C", "D"],
                "correct_answer": 0
            }
        ]

async def chat_with_content(
    content_ids: List[str], 
    message: str, 
    history: List[Dict]
) -> AsyncGenerator[str, None]:
    """Chat with multiple content sources using RAG and streaming"""
    
    # Get relevant context from all content sources
    all_relevant_chunks = []
    for content_id in content_ids:
        relevant_chunks = await search_similar(content_id, message, limit=2)
        all_relevant_chunks.extend(relevant_chunks)
    
    context = "\n\n".join(all_relevant_chunks)
    
    # Build prompt
    system_prompt = f"""You are a helpful AI tutor. Answer questions based on the following content.
If the answer is not in the content, say so politely.

Content:
{context}"""
    
    # Build conversation
    full_prompt = system_prompt + "\n\n"
    for msg in history[-5:]:  # Last 5 messages
        full_prompt += f"{msg['role']}: {msg['content']}\n"
    full_prompt += f"user: {message}\nassistant: "
    
    # Stream response
    response = model.generate_content(full_prompt, stream=True)
    
    for chunk in response:
        if chunk.text:
            yield f"data: {json.dumps({'content': chunk.text})}\n\n"
    
    yield "data: [DONE]\n\n"
