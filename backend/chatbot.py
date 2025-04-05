import os
import logging
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize logger
logging.basicConfig(level=logging.INFO)

# File to store conversation history
CONVERSATION_FILE = 'conversation_history.txt'

def clear_conversation_history():
    with open(CONVERSATION_FILE, 'w', encoding='utf-8') as f:
        f.write("") 

def load_inference_client():
    api_key = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not api_key:
        raise ValueError("Hugging Face API key not found in environment variables.")

    # Initialize the Inference Client with your API key
    client = InferenceClient(
        provider="together",
        api_key=api_key,
    )
    return client


def save_to_memory(user_input: str, bot_response: str):
    with open(CONVERSATION_FILE, 'a', encoding='utf-8') as f:
        f.write(f"User: {user_input}\n")
        f.write(f"Bot: {bot_response}\n")

def load_conversation_history():
    if os.path.exists(CONVERSATION_FILE):
        with open(CONVERSATION_FILE, 'r', encoding='utf-8') as f:
            return f.read()
    return ""

def summarize_conversation(client):
    """Summarizes previous conversation history using DeepSeek-V3 model."""
    conversation_history = load_conversation_history()
    history_lines = conversation_history.strip().split('\n')[-20:]  # Taking the last 20 lines for summarization
    conversation_text = "\n".join(history_lines)
    
    if not conversation_text.strip():
        return "No prior conversation history."

    try:
        # Requesting DeepSeek-V3 to summarize the conversation
        completion = client.text_generation(
          model="deepseek-ai/DeepSeek-V3",
          prompt=f"Summarize the following conversation:\n{conversation_text}",
          max_length=200,
        )



        summarized_history = completion["generated_text"]
        return summarized_history

    except Exception as e:
        logging.error(f"Failed to summarize conversation: {e}")
        return conversation_text  # Fall back to raw conversation if summarization fails


def chat_with_gemini(prompt, client):
    try:
        # Retrieve summarized conversation history
        summarized_history = summarize_conversation(client)
        
        # Provide the summarized history as context
        messages = [
            {"role": "system", "content": "You are an intelligent assistant."},
            {"role": "user", "content": summarized_history},
            {"role": "user", "content": prompt}
        ]

        completion = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-V3",  # Use your desired model
            messages=messages,
            max_tokens=500,
        )
        response = completion.choices[0].message['content']

        # Save conversation to memory for future summarization
        save_to_memory(prompt, response)
        
        return response

    except Exception as e:
        logging.error(f"Failed to get response from model: {e}")
        return "Error in generating response from model."
