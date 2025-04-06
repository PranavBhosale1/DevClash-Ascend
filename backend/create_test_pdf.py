from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_test_pdf(filename="test.pdf"):
    """Create a simple PDF file with sample text for testing purposes."""
    c = canvas.Canvas(filename, pagesize=letter)
    
    # Add a title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, 750, "Test PDF Document")
    
    # Add some paragraphs
    c.setFont("Helvetica", 12)
    y_position = 700
    
    paragraphs = [
        "This is a test PDF document created for testing the PDF processing functionality.",
        "",
        "The document contains multiple paragraphs with sample text that should be processed and summarized.",
        "",
        "The summarization system should extract text from this PDF file and generate a concise summary.",
        "",
        "This test is designed to verify that the PDF text extraction and summarization system works correctly.",
        "",
        "The text should be properly extracted, split into chunks if necessary, and then summarized.",
        "",
        "If you're seeing this text in a summary, it means the PDF processing functionality is working correctly.",
        "",
        "This document is intentionally simple to allow for easy verification of the processing pipeline."
    ]
    
    for paragraph in paragraphs:
        c.drawString(72, y_position, paragraph)
        y_position -= 20
    
    # Save the PDF
    c.save()
    print(f"Test PDF created: {filename}")

if __name__ == "__main__":
    create_test_pdf()
    print("Use this file for testing the PDF processing functionality.") 