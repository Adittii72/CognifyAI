import uuid
import yt_dlp
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
        
        # Use yt-dlp to get subtitles
        ydl_opts = {
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['en'],
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            
            # Try to get subtitles
            subtitles = info.get('subtitles', {}).get('en') or info.get('automatic_captions', {}).get('en')
            
            if not subtitles:
                raise Exception("No subtitles available for this video")
            
            # Get the subtitle URL (prefer vtt format)
            subtitle_url = None
            for sub in subtitles:
                if sub.get('ext') == 'vtt':
                    subtitle_url = sub.get('url')
                    break
            
            if not subtitle_url and subtitles:
                subtitle_url = subtitles[0].get('url')
            
            if not subtitle_url:
                raise Exception("Could not find subtitle URL")
            
            # Download and parse subtitles
            import requests
            response = requests.get(subtitle_url)
            subtitle_text = response.text
            
            # Simple VTT parsing - extract text only
            lines = subtitle_text.split('\n')
            full_text = []
            for line in lines:
                line = line.strip()
                # Skip timestamps and metadata
                if line and not line.startswith('WEBVTT') and '-->' not in line and not line.isdigit():
                    full_text.append(line)
            
            full_text = " ".join(full_text)
            
            if not full_text:
                raise Exception("Could not extract text from subtitles")
        
        # Generate unique content ID
        content_id = str(uuid.uuid4())
        
        # Store in memory
        store_content(content_id, 'youtube', full_text)
        
        return content_id, full_text
    
    except Exception as e:
        raise Exception(f"Failed to process YouTube video: {str(e)}")
