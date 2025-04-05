import { NextResponse } from 'next/server';
import { checkGeminiConfig } from '@/lib/gemini';

export async function GET() {
  try {
    const configCheck = await checkGeminiConfig();
    return NextResponse.json({ 
      success: true, 
      message: 'Gemini API configuration is valid',
      config: configCheck 
    });
  } catch (error) {
    console.error('Error checking Gemini config:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error checking Gemini configuration', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Extract request body
    const body = await request.json();
    const { skills, timeCommitment } = body;
    
    // Mock response structure similar to what Gemini would return
    const mockLearningPath = {
      title: "Your Learning Path",
      skills: skills || ["Web Development", "JavaScript"],
      timeCommitment: timeCommitment || "2 weeks",
      modules: [
        {
          title: "Fundamentals",
          description: "Core concepts and basics",
          duration: "3 days",
          resources: [
            {
              title: "Introduction to Web Development",
              type: "article",
              url: "https://developer.mozilla.org/en-US/docs/Learn",
              description: "Comprehensive guide to web development"
            },
            {
              title: "JavaScript Basics",
              type: "video",
              url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
              description: "Learn JavaScript fundamentals in 1 hour"
            }
          ]
        },
        {
          title: "Advanced Concepts",
          description: "Deepen your understanding",
          duration: "5 days",
          resources: [
            {
              title: "Advanced JavaScript Patterns",
              type: "course",
              url: "https://javascript.info/",
              description: "In-depth JavaScript tutorials"
            },
            {
              title: "Building Web Applications",
              type: "project",
              url: "https://github.com/topics/javascript-projects",
              description: "Hands-on project to apply your skills"
            }
          ]
        }
      ]
    };
    
    // Simulate delay to mimic AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({ success: true, learningPath: mockLearningPath });
  } catch (error) {
    console.error('Error in mock Gemini API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error processing request', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 