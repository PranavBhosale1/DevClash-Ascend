import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

// Check if we need to create a new model or if it already exists
const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', new mongoose.Schema(
  {
    roadmapId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    supabaseUserId: { type: String, required: true, index: true }, // Explicitly store Supabase user ID
    title: { type: String, required: true },
    description: { type: String },
    topics: [
      {
        name: { type: String, required: true },
        queries: [{ type: String }],
        links: [[{ type: String }]], // Array of arrays of links (each query has multiple links)
        day: { type: Number },
        position: { type: Number }
      }
    ]
  },
  { timestamps: true }
));

export async function POST(request: Request) {
  try {
    console.log('API route called: /api/roadmaps/save');
    
    // Connect to MongoDB
    await connectToDatabase();
    console.log('Connected to MongoDB successfully');
    
    // Parse the request body
    const data = await request.json();
    console.log('Received data:', { 
      roadmapId: data.roadmapId, 
      userId: data.userId, 
      topicsCount: data.topics?.length 
    });
    
    // Validate required fields
    if (!data.roadmapId || !data.userId || !data.topics) {
      console.error('Missing required fields:', { 
        roadmapId: !!data.roadmapId, 
        userId: !!data.userId, 
        topics: !!data.topics 
      });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log('Saving roadmap to MongoDB...');
    // Create or update the roadmap
    const roadmap = await Roadmap.findOneAndUpdate(
      { roadmapId: data.roadmapId },
      {
        roadmapId: data.roadmapId,
        userId: data.userId,
        supabaseUserId: data.userId, // Store Supabase user ID in its own field
        title: data.title,
        description: data.description,
        topics: data.topics
      },
      { upsert: true, new: true }
    );
    
    console.log('Roadmap saved successfully:', roadmap._id);
    return NextResponse.json({ 
      success: true, 
      message: 'Roadmap saved successfully',
      id: roadmap._id 
    });
  } catch (error) {
    console.error('Error in roadmap save API:', error);
    
    // More detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    };
    
    console.error('Detailed error:', errorDetails);
    
    return NextResponse.json(
      { 
        message: 'Failed to save roadmap', 
        error: errorDetails.message,
        details: errorDetails
      },
      { status: 500 }
    );
  }
} 