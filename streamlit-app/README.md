# Ascend Flow Streamlit App

This is a Streamlit-based learning path generator for Ascend Flow. It provides an interactive interface for creating personalized learning paths for various skills.

## Features

- Generate learning paths for different skills
- Customize time commitment
- Interactive UI with expandable modules
- Track your progress with checkboxes
- Download learning paths as JSON

## Setup

1. Install the required packages:

```bash
pip install -r requirements.txt
```

2. Run the Streamlit app:

```bash
streamlit run app.py
```

3. Access the app in your browser at:
   http://localhost:8501

## Integration Options

### Option 1: Standalone App
Run this app separately and link to it from your Next.js application.

### Option 2: Embedded via iframe
Embed the Streamlit app in your Next.js application using an iframe:

```jsx
// Example React component
const StreamlitEmbed = () => {
  return (
    <iframe
      src="http://localhost:8501?embed=true"
      height="800px"
      width="100%"
      style={{ border: 'none' }}
      title="Ascend Flow Streamlit App"
    />
  );
};
```

### Option 3: Flask API Integration
For tighter integration, create a Flask API that connects to the Next.js app:

1. Create a Flask server that handles API requests
2. Modify the Streamlit app to use the Flask API
3. Configure the Next.js `rewrites` in `next.config.mjs` to proxy API calls

## Contributing

Feel free to contribute to this project by submitting pull requests or issues.

## License

[MIT License](LICENSE) 