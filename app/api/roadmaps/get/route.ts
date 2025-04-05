import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    console.log('Fetching roadmap from MongoDB...');
    const { searchParams } = new URL(request.url);
    const roadmapId = searchParams.get('roadmapId');
    const supabaseUserId = searchParams.get('supabaseUserId');
    
    if (!roadmapId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Roadmap ID is required' 
      }, { status: 400 });
    }
    
    // Connect to the database
    const client = await connectToDatabase();
    console.log('Connected to MongoDB');
    
    // Create Roadmap model
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
      completedVideos: [{ type: String }],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    
    const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);
    
    // Also define UserProgress model for user-specific progress
    const UserProgressSchema = new mongoose.Schema({
      roadmapId: { type: String, required: true },
      supabaseUserId: { type: String, required: true },
      completedVideos: [{ type: String }],
      completedTopics: [{ type: String }],
      lastUpdated: { type: Date, default: Date.now }
    });
    
    const UserProgress = mongoose.models.UserProgress || 
      mongoose.model('UserProgress', UserProgressSchema);
    
    // Find the roadmap by ID
    const roadmap = await Roadmap.findOne({ roadmapId });
    
    if (!roadmap) {
      return NextResponse.json({ 
        success: false, 
        message: 'Roadmap not found' 
      }, { status: 404 });
    }
    
    console.log(`Found roadmap with ID ${roadmapId}`);
    
    // Convert to object
    let roadmapObj = roadmap.toObject();
    
    // If supabaseUserId is provided, fetch user-specific progress
    if (supabaseUserId) {
      console.log(`Fetching progress for user ${supabaseUserId}`);
      const userProgress = await UserProgress.findOne({
        roadmapId,
        supabaseUserId
      });
      
      if (userProgress) {
        console.log('Found user progress:', userProgress);
        
        // Add user progress data to roadmap object
        roadmapObj.completedVideos = userProgress.completedVideos || [];
        
        // Update topics with completed status based on completedTopics
        if (userProgress.completedTopics && userProgress.completedTopics.length > 0) {
          const completedTopicsSet = new Set(userProgress.completedTopics);
          
          roadmapObj.topics = roadmapObj.topics.map((topic: any) => {
            return {
              ...topic,
              completed: completedTopicsSet.has(topic._id.toString())
            };
          });
        }
      } else {
        console.log('No user progress found, creating empty progress');
        // Initialize empty progress
        roadmapObj.completedVideos = [];
      }
    }
    
    // Count total videos in roadmap
    const totalVideos = roadmapObj.topics.reduce((total: number, topic: any) => {
      return total + topic.links.reduce((sum: number, linkGroup: string[]) => sum + linkGroup.length, 0);
    }, 0);
    
    // Count completed videos (if any)
    const completedVideos = roadmapObj.completedVideos || [];
    
    // Calculate progress percentage
    const progress = totalVideos > 0 ? Math.round((completedVideos.length / totalVideos) * 100) : 0;
    
    const roadmapWithProgress = {
      ...roadmapObj,
      progress,
      totalVideos
    };
    
    return NextResponse.json({ 
      success: true, 
      roadmap: roadmapWithProgress
    });
    
  } catch (error: any) {
    console.error('Error fetching roadmap:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching the roadmap',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }, { status: 500 });
  }
} 