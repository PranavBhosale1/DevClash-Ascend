import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

// Define Roadmap Schema
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

// Define UserProgress Schema
const UserProgressSchema = new mongoose.Schema({
  roadmapId: { type: String, required: true },
  supabaseUserId: { type: String, required: true },
  completedVideos: [{ type: String }],
  completedTopics: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now }
});

// Create a compound index for roadmapId and supabaseUserId
UserProgressSchema.index({ roadmapId: 1, supabaseUserId: 1 }, { unique: true });

export async function POST(request: Request) {
  console.log('API route called: /api/roadmaps/progress');
  
  try {
    // Get the request data before connecting to DB to verify it's valid
    let data;
    try {
      data = await request.json();
      console.log('Received progress data:', data);
    } catch (parseError) {
      console.error('Error parsing request JSON:', parseError);
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid JSON in request body' 
      }, { status: 400 });
    }
    
    // Validate required fields
    if (!data.roadmapId || !data.supabaseUserId) {
      console.error('Missing required fields in request data');
      return NextResponse.json({ 
        success: false, 
        message: 'Roadmap ID and Supabase User ID are required' 
      }, { status: 400 });
    }
    
    // Connect to the database
    try {
      console.log('Connecting to MongoDB...');
      await connectToDatabase();
      console.log('Connected to MongoDB successfully');
    } catch (dbError: any) {
      console.error('Failed to connect to MongoDB:', dbError);
      return NextResponse.json({ 
        success: false, 
        message: 'Database connection error',
        error: dbError.message
      }, { status: 500 });
    }
    
    // Create models
    const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);
    const UserProgress = mongoose.models.UserProgress || mongoose.model('UserProgress', UserProgressSchema);
    
    // First check if the roadmap exists
    let existingRoadmap;
    try {
      existingRoadmap = await Roadmap.findOne({ roadmapId: data.roadmapId });
      console.log('Found roadmap to update:', existingRoadmap ? existingRoadmap.title : 'None');
    } catch (findError: any) {
      console.error('Error finding roadmap:', findError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error finding roadmap',
        error: findError.message
      }, { status: 500 });
    }
    
    if (!existingRoadmap) {
      return NextResponse.json({ 
        success: false, 
        message: 'Roadmap not found' 
      }, { status: 404 });
    }
    
    // Prepare user progress data
    const progressData = {
      roadmapId: data.roadmapId,
      supabaseUserId: data.supabaseUserId,
      completedVideos: data.completedVideos || [],
      completedTopics: data.completedTopics || [],
      lastUpdated: new Date()
    };
    
    console.log('Saving user progress:', progressData);
    
    // Save to UserProgress collection - upsert will create if not exists
    let userProgress;
    try {
      userProgress = await UserProgress.findOneAndUpdate(
        { 
          roadmapId: data.roadmapId,
          supabaseUserId: data.supabaseUserId
        },
        progressData,
        { upsert: true, new: true }
      );
      console.log('Successfully saved user progress');
    } catch (updateError: any) {
      console.error('Error saving user progress:', updateError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error saving user progress',
        error: updateError.message
      }, { status: 500 });
    }
    
    // Now we need to send back the updated roadmap with the progress data
    // First get a clean copy of the roadmap
    const roadmapObj = existingRoadmap.toObject();
    
    // Add progress data to the roadmap
    const roadmapWithProgress = {
      ...roadmapObj,
      completedVideos: userProgress.completedVideos,
      totalVideos: roadmapObj.topics.reduce((total: number, topic: any) => {
        return total + topic.links.reduce((sum: number, linkGroup: string[]) => sum + linkGroup.length, 0);
      }, 0)
    };
    
    // Update topics with completed status
    if (userProgress.completedTopics && userProgress.completedTopics.length > 0) {
      const completedTopicsSet = new Set(userProgress.completedTopics);
      
      roadmapWithProgress.topics = roadmapObj.topics.map((topic: any) => {
        return {
          ...topic,
          completed: completedTopicsSet.has(topic._id.toString())
        };
      });
    }
    
    // Calculate progress percentage
    roadmapWithProgress.progress = roadmapWithProgress.totalVideos > 0 
      ? Math.round((userProgress.completedVideos.length / roadmapWithProgress.totalVideos) * 100) 
      : 0;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Progress updated successfully',
      roadmap: roadmapWithProgress
    });
    
  } catch (error: any) {
    console.error('Unexpected error in saving roadmap progress:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'An error occurred while saving progress',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }, { status: 500 });
  }
} 