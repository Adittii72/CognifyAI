import uuid
from fastapi import UploadFile
from PyPDF2 import PdfReader
from io import BytesIO
from simple_storage import store_content

async def process_pdf_document(file: UploadFile) -> tuple[str, str]:
    """Process PDF document and extract text"""
    try:
        # Read PDF content
        content = await file.read()
        pdf_reader = PdfReader(BytesIO(content))
        
        # Extract text from all pages
        full_text = ""
        for page in pdf_reader.pages:
            full_text += page.extract_text() + "\n"
        
        if not full_text.strip():
            raise ValueError("No text could be extracted from PDF")
        
        # Generate unique content ID
        content_id = str(uuid.uuid4())
        
        # Store in memory
        store_content(content_id, 'pdf', full_text)
        
        return content_id, full_text
    
    except Exception as e:
        raise Exception(f"Failed to process PDF: {str(e)}")
