import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export async function POST(request: Request) {
  try {
    const { prompt, activeVideoUrl } = await request.json();  // ✅ Receive both prompt and activeVideoUrl

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, activeVideoUrl }),  // ✅ Send both prompt and activeVideoUrl to Flask
    });

    if (!response.ok) {
      throw new Error(`Flask API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error from Flask API:", error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
