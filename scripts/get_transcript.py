import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

if __name__ == "__main__":
    video_id = sys.argv[1]
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        result = "\n".join([entry['text'] for entry in transcript])
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
