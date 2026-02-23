import uuid
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
from simple_storage import store_content

def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL"""
    parsed_url = urlparse(url)
    
    if parsed_url.hostname in ['www.youtube.com', 'youtube.com']:
        if parsed_url.path == '/watch':
            return parse_qs(parsed_url.query)['v'][0]
        elif parsed_url.path.startswith('/embed/'):
            return parsed_url.path.split('/')[2]
    elif parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]
    
    raise ValueError("Invalid YouTube URL")

async def process_youtube_video(url: str) -> tuple[str, str]:
    """Process YouTube video and extract transcript"""
    try:
        video_id = extract_video_id(url)
        
        # Use the new API
        api = YouTubeTranscriptApi()
        transcript_obj = api.fetch(video_id)
        
        # Get the transcript snippets
        snippets = transcript_obj.snippets
        
        # Combine transcript into single text
        full_text = " ".join([snippet.text for snippet in snippets])
        
        # Generate unique content ID
        content_id = str(uuid.uuid4())
        
        # Store in memory
        store_content(content_id, 'youtube', full_text)
        
        return content_id, full_text
    
    except Exception as e:
        raise Exception(f"Failed to process YouTube video: {str(e)}")
