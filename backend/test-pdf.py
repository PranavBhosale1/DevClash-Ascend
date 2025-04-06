import cohere
import sys

# Test Cohere API connectivity and functionality
API_KEY = "hdqOGa8wYVJQJUcDl1jK0owxJVLbC9QfLEtw4HCm"

print("Testing Cohere API connectivity...")

try:
    # Initialize client
    co = cohere.Client(API_KEY)
    
    # Test with simple text
    test_text = """
    This is a test document to verify that the Cohere API is working correctly.
    It contains multiple sentences that should be summarized.
    The summary should capture the main points of this text.
    We're testing to make sure the API can handle the request and generate a proper response.
    If this works, then we know the API is functioning as expected.
    """
    
    print("Sending test summarization request...")
    response = co.summarize(
        text=test_text,
        length='short',
        format='paragraph',
        model='command',
        temperature=0.3
    )
    
    print("\nSummarization successful!")
    print("Summary result:", response.summary)
    print("\nAPI is working correctly!")
    
except Exception as e:
    print(f"Error testing Cohere API: {str(e)}")
    print(f"Error type: {type(e).__name__}")
    print("API connection test failed. Check your API key and internet connection.")
    sys.exit(1)

print("\nTest completed successfully.") 