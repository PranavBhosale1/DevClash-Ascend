from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
from chatbot import chat_with_gemini, load_inference_client, clear_conversation_history  # Import your chatbot function

app = Flask(__name__)
CORS(app, origins="*") 

# Initialize client
client = load_inference_client()

# Files for storing URL and conversation history
LAST_VIDEO_URL_FILE = 'last_video_url.txt'
CONVERSATION_FILE = 'conversation_history.txt'

def load_last_video_url():
    if os.path.exists(LAST_VIDEO_URL_FILE):
        with open(LAST_VIDEO_URL_FILE, 'r') as f:
            return f.read().strip()
    return None

def save_last_video_url(url):
    with open(LAST_VIDEO_URL_FILE, 'w') as f:
        f.write(url)

def clear_conversation_history():
    open(CONVERSATION_FILE, 'w').close()  # Clears the conversation history file

@app.route('/chat', methods=['POST'])
def chat():
    try:
        if request.content_type != 'application/json':
            return jsonify({"error": "Content-Type must be application/json"}), 400

        data = request.get_json(force=True)
        logging.info(f"Received hhhh data: {data}")

        if not data or 'prompt' not in data:
            return jsonify({"error": "Prompt not provided"}), 400

        prompt = data['prompt']
        active_video_url = data.get('activeVideoUrl')  # Retrieve active URL from the request

        # ✅ Print the active video URL to console
        print(f"Active Video URL received: {active_video_url}")
        logging.info(f"Active Video URL: {active_video_url}")

        # Check if URL has changed
        last_url = load_last_video_url()
        if active_video_url and (active_video_url != last_url):
            clear_conversation_history()  # Clear previous conversation history
            save_last_video_url(active_video_url)  # Save the new URL
        
        # Process the prompt and get a response from the model
        response_text = chat_with_gemini(prompt, client)
        return jsonify({"response": response_text})
    
    except Exception as e:
        logging.error(f"Error in chat route: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
