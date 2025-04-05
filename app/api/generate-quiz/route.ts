import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();

  if (!transcript) {
    return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
  }
  if (!transcript || transcript.trim() === "") {
    throw new Error("Transcript is empty. Cannot generate quiz.");
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Create a quiz with 2-3 multiple-choice questions based on knowledge purely based on transcript and the question should be acurate and from the transcript also keep in mind you are taking my test and helping me to prepare for exam  from the following transcript:

    "${transcript}"

    Format the response as a JSON array with this structure:
    [
      {
        "question": "What is X?",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "B",
        "topic": "Topic name",
        "explanation": "Explanation of why B is correct"
      }
    ]
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    if (!text || text.trim().length === 0) {
        throw new Error("Quiz generation failed: Response text is empty.");
      }
    // Optional: Clean up code block formatting if Gemini returns markdown
    const cleanText = text.replace(/```json|```/g, '');

    const questions = JSON.parse(cleanText);
    console.log("Generated Quiz Questions backend:", questions);
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Quiz generation failed: No questions were generated.");
      }
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Gemini Quiz Generation Error:", error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
