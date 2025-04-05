import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    console.log('Deleting roadmap from MongoDB...');
    
    // Parse the request body
    const body = await request.json();
    const { roadmapId, supabaseUserId } = body;
    
    // Validate required fields
    if (!roadmapId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Roadmap ID is required' 
      }, { status: 400 });
    }
    
    if (!supabaseUserId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Supabase user ID is required' 
      }, { status: 400 });
    }
    
    // Connect to the database
    const client = await connectToDatabase();
    console.log('Connected to MongoDB');
    
    // Create Roadmap schema
    const RoadmapSchema = new mongoose.Schema({
      roadmapId: { type: String, required: true, unique: true },
      userId: { type: String, required: true },
      supabaseUserId: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String },
      topics: [{
        name: { type: String, required: true },
        queries: [{ type: String }],
        links: [[{ type: String }]],
        day: { type: Number },
        position: { type: Number },
        completed: { type: Boolean, default: false },
        _id: { type: String }
      }],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    
    // Define UserProgress Schema to clean up related data
    const UserProgressSchema = new mongoose.Schema({
      roadmapId: { type: String, required: true },
      supabaseUserId: { type: String, required: true },
      completedVideos: [{ type: String }],
      completedTopics: [{ type: String }],
      lastUpdated: { type: Date, default: Date.now }
    });
    
    // Get models
    const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);
    const UserProgress = mongoose.models.UserProgress || mongoose.model('UserProgress', UserProgressSchema);
    
    // Find the roadmap and verify ownership
    const roadmap = await Roadmap.findOne({ roadmapId, supabaseUserId });
    
    if (!roadmap) {
      return NextResponse.json({ 
        success: false, 
        message: 'Roadmap not found or you do not have permission to delete it' 
      }, { status: 404 });
    }
    
    // Delete the roadmap
    await Roadmap.deleteOne({ roadmapId, supabaseUserId });
    
    // Also delete any associated progress data
    await UserProgress.deleteOne({ roadmapId, supabaseUserId });
    
    console.log(`Roadmap ${roadmapId} successfully deleted`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Roadmap successfully deleted' 
    });
  } catch (error: any) {
    console.error('Error deleting roadmap:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'An error occurred while deleting the roadmap',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }, { status: 500 });
  }
} 