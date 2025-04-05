import { NextResponse } from 'next/server';
import { generateResponseFromTranscript } from '@/lib/gemini'; // Assuming you have this function

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { success: false, message: 'Transcript is required.' },
        { status: 400 }
      );
    }

    const response = await generateResponseFromTranscript(transcript);
    console.log("Response from generateResponseFromTranscript:", response);
    return NextResponse.json({ success: true, notes: response });

  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error generating response',
      },
      { status: 500 }
    );
  }
}