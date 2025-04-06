from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import tempfile
import uuid
from werkzeug.utils import secure_filename
import PyPDF2
import docx
import cohere

app = Flask(__name__)
CORS(app, origins="*") 

# ========== PDF Processing Config ==========
COHERE_API_KEY = "hdqOGa8wYVJQJUcDl1jK0owxJVLbC9QfLEtw4HCm"  # Replace with your Cohere key
CHUNK_SIZE = 3000                # Characters per chunk (Cohere limit ~3000–4000)
# ==========================================

# Initialize Cohere client
cohere_client = cohere.Client(COHERE_API_KEY)

# Set up logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('syllabus-processor')

# Extract text from PDF
def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text()
    return text

# Extract text from DOCX
def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

# Split large text into manageable chunks
def chunk_text(text, max_length):
    return [text[i:i+max_length] for i in range(0, len(text), max_length)]

# Summarize using Cohere
def summarize_text(text):
    try:
        response = cohere_client.summarize(
            text=text,
            length='long',
            format='paragraph',
            model='command',
            temperature=0.3
        )
        return response.summary
    except Exception as e:
        logger.error(f"Error during summarization: {e}")
        return ""

@app.route('/process-syllabus', methods=['POST'])
def process_syllabus():
    try:
        logger.info("Processing syllabus file")
        
        if 'file' not in request.files:
            logger.error("No file provided")
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            logger.error("No file selected")
            return jsonify({"error": "No file selected"}), 400
            
        # Check file type
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ['.pdf', '.docx']:
            logger.error(f"Unsupported file type: {file_ext}")
            return jsonify({"error": "Only PDF and DOCX files are supported"}), 400
        
        # Save the file temporarily
        temp_dir = tempfile.gettempdir()
        filename = secure_filename(f"{uuid.uuid4()}{file_ext}")
        file_path = os.path.join(temp_dir, filename)
        file.save(file_path)
        
        logger.info(f"File saved at {file_path}")
        
        # Extract text based on file type
        if file_ext == '.pdf':
            raw_text = extract_text_from_pdf(file_path)
        elif file_ext == '.docx':
            raw_text = extract_text_from_docx(file_path)
        
        logger.info(f"Extracted {len(raw_text)} characters of text")
        
        # Process the text in chunks
        chunks = chunk_text(raw_text, CHUNK_SIZE)
        logger.info(f"Split into {len(chunks)} chunks for summarization")
        
        # Summarize each chunk
        summaries = []
        for i, chunk in enumerate(chunks):
            logger.info(f"Summarizing chunk {i+1}/{len(chunks)}")
            summary = summarize_text(chunk)
            if summary:
                summaries.append(summary)
        
        # Combine summaries
        final_summary = "\n\n".join(summaries)
        
        # Clean up
        try:
            os.remove(file_path)
            logger.info("Temporary file removed")
        except Exception as e:
            logger.warning(f"Failed to remove temporary file: {e}")
        
        if not final_summary:
            logger.error("Failed to generate summary")
            return jsonify({"error": "Failed to generate summary"}), 500
            
        logger.info(f"Successfully generated summary ({len(final_summary)} chars)")
        return jsonify({"success": True, "summary": final_summary})
        
    except Exception as e:
        logger.error(f"Error in process_syllabus: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Flask server is running"}), 200

if __name__ == '__main__':
    logger.info("Starting Flask server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000)
