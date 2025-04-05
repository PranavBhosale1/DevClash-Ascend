import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    console.log('Fetching roadmaps from MongoDB...');
    const { searchParams } = new URL(request.url);
    const supabaseUserId = searchParams.get('supabaseUserId');
    
    if (!supabaseUserId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Supabase user ID is required' 
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
    
    const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);
    const UserProgress = mongoose.models.UserProgress || mongoose.model('UserProgress', UserProgressSchema);
    
    // Fetch roadmaps for the user
    const roadmaps = await Roadmap.find({ supabaseUserId });
    
    console.log(`Found ${roadmaps.length} roadmaps for user ${supabaseUserId}`);
    
    // Fetch user progress for all roadmaps
    const userProgressList = await UserProgress.find({ supabaseUserId });
    
    // Create a map for quick lookup of progress by roadmapId
    const progressMap = new Map();
    userProgressList.forEach(progress => {
      progressMap.set(progress.roadmapId, progress);
    });
    
    console.log(`Found progress data for ${userProgressList.length} roadmaps`);
    
    // Add progress information for each roadmap
    const roadmapsWithProgress = roadmaps.map(roadmap => {
      const roadmapObj = roadmap.toObject();
      
      // Get progress for this roadmap
      const progress = progressMap.get(roadmapObj.roadmapId);
      
      // Count total videos in roadmap
      const totalVideos = roadmapObj.topics.reduce((total: number, topic: any) => {
        return total + topic.links.reduce((sum: number, linkGroup: string[]) => sum + linkGroup.length, 0);
      }, 0);
      
      // Get completed videos from progress or empty array
      const completedVideos = progress ? progress.completedVideos || [] : [];
      
      // If there's progress data, update topic completion status
      if (progress && progress.completedTopics && progress.completedTopics.length > 0) {
        const completedTopicsSet = new Set(progress.completedTopics);
        
        roadmapObj.topics = roadmapObj.topics.map((topic: any) => {
          return {
            ...topic,
            completed: completedTopicsSet.has(topic._id.toString())
          };
        });
      }
      
      // Calculate progress percentage
      const progressPercentage = totalVideos > 0 ? Math.round((completedVideos.length / totalVideos) * 100) : 0;
      
      return {
        ...roadmapObj,
        completedVideos,
        progress: progressPercentage,
        totalVideos
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      roadmaps: roadmapsWithProgress
    });
    
  } catch (error: any) {
    console.error('Error fetching roadmaps:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching roadmaps',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }, { status: 500 });
  }
} 