"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

interface ChatProps {
    activeVideoUrl: string;
    editableNotes: string | string[];
}

export default function Chat({ activeVideoUrl, editableNotes }: ChatProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{user: string, bot: string}[]>([{ user: '', bot: 'Chat has been reset. Waiting for transcript processing...' }]);
    const [isLoading, setIsLoading] = useState(false);
    const [previousUrl, setPreviousUrl] = useState<string | null>(null);

    useEffect(() => {
        if (activeVideoUrl && activeVideoUrl !== previousUrl) {
            setMessages([{ user: '', bot: 'Chat has been reset. Waiting for transcript processing...' }]); // Visible cleared message
            setPreviousUrl(activeVideoUrl);
            console.log(`%c📥 Transcript Received `);
            handleTranscriptInitialization();
        }
    }, [activeVideoUrl]); // Triggered every time activeVideoUrl changes

    const handleTranscriptInitialization = async () => {
        setIsLoading(true);
        const transcriptResponse = await axios.post("/api/transcript", { videoUrl: activeVideoUrl });
        if (!activeVideoUrl) {  // Check if the notes are empty or contain only whitespace
            throw new Error("Editable notes cannot be empty.");
          }
      
        try {
            const response = await axios.post('/api/gemini_chat', 
                { 
                    prompt: `The transcript of the video is: ${transcriptResponse.data.transcript}. Please acknowledge.`,
                    activeVideoUrl: activeVideoUrl  // Sending the active URL along with the prompt
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            const botResponse = response.data.response;
            setMessages(prevMessages => [...prevMessages, { user: `${Array.isArray(editableNotes) ? editableNotes.join(" ") : editableNotes}`, bot: botResponse }]);
        } catch (error) {
            console.error("Error:", error);
            setMessages(prevMessages => [...prevMessages, { user: '', bot: "Error: Unable to process transcript." }]);
        }
        setIsLoading(false);
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return; 

        setIsLoading(true);

        try {
            const response = await axios.post('/api/gemini_chat', 
                { prompt: input,
                    activeVideoUrl: activeVideoUrl // Pass the active video URL to the backend
                 },
                { headers: { 'Content-Type': 'application/json' } }
            );
            const botResponse = response.data.response;
            const cleanedLines = botResponse
            .split('\n')
            .map((line: string) => line.replace(/\*/g, '').trim()); // Explicitly typing line as string
          
          const cleanedResponse = cleanedLines.join('\n');
        
          const cleanedInput = botResponse
          .split('\n')
          .map((line: string) => line.replace(/\*/g, '').trim()); // Explicitly typing line as string
        
        const FinalResponse = cleanedInput.join('\n');

          setMessages(prevMessages => [
            ...prevMessages,
            { user:  FinalResponse, bot: cleanedResponse }
          ]);

            setInput('');
        } catch (error) {
            console.error("Error:", error);
        }

        setIsLoading(false);
    };

    return (
        <div className="p-4 bg-gray-900 text-white rounded-2xl shadow-lg max-w-3xl mx-auto">
            <div className="mb-4 h-96 overflow-y-auto bg-gray-800 p-4 rounded-lg">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-4">
                        {msg.user && <p><strong>You:</strong> {msg.user}</p>}
                        {msg.bot && <p><strong>Desend:</strong> {msg.bot}</p>}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-grow p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <button 
                    onClick={sendMessage}
                    className={`px-4 py-2 rounded-lg ${isLoading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"}`}
                    disabled={isLoading}
                >
                    {isLoading ? "Waiting..." : "Send"}
                </button>
            </div>
        </div>
    );
}
