import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Badge, { IBadge } from '@/models/Badge';

// Define default badges
const defaultBadges = [
  {
    badgeId: 1,
    name: "Fast Learner",
    description: "Completed 5 topics in a single day",
    iconType: "zap",
    progress: 0,
    total: 5
  },
  {
    badgeId: 2,
    name: "Quiz Master",
    description: "Scored 100% in 3 consecutive quizzes",
    iconType: "star",
    progress: 0,
    total: 3
  },
  {
    badgeId: 3,
    name: "Dedicated Scholar",
    description: "Studied for more than 10 hours in a week",
    iconType: "clock",
    progress: 0,
    total: 10
  },
  {
    badgeId: 4,
    name: "Knowledge Seeker",
    description: "Completed 20 topics",
    iconType: "book",
    progress: 0,
    total: 20
  },
  {
    badgeId: 5,
    name: "Perfect Attendance",
    description: "Logged in for 14 consecutive days",
    iconType: "award",
    progress: 0,
    total: 14
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID is required' 
      }, { status: 400 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find badges for the user
    let userBadges = await Badge.find({ userId });
    
    // If user has no badges yet, create default badges for them
    if (userBadges.length === 0) {
      const badgesToCreate = defaultBadges.map(badge => ({
        ...badge,
        userId,
        earned: false
      }));
      
      await Badge.insertMany(badgesToCreate);
      userBadges = await Badge.find({ userId });
    }
    
    // Update progress data based on user's activity
    // This would typically be done by more complex logic that checks user's completion stats
    // Here we're using what's in the database for demonstration
    
    // Return badges data
    return NextResponse.json({
      success: true,
      badges: userBadges
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch badges'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, badgeId, progress, earned, earnedDate } = await request.json();
    
    if (!userId || badgeId === undefined) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID and badge ID are required' 
      }, { status: 400 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the badge
    const badge = await Badge.findOne({ userId, badgeId });
    
    if (!badge) {
      return NextResponse.json({ 
        success: false, 
        message: 'Badge not found' 
      }, { status: 404 });
    }
    
    // Update badge
    const updateData: any = {};
    if (progress !== undefined) updateData.progress = progress;
    if (earned !== undefined) {
      updateData.earned = earned;
      if (earned && !badge.earned) {
        updateData.earnedDate = earnedDate || new Date();
      }
    }
    
    const updatedBadge = await Badge.findOneAndUpdate(
      { userId, badgeId },
      updateData,
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      badge: updatedBadge
    });
  } catch (error) {
    console.error('Error updating badge:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update badge'
    }, { status: 500 });
  }
} 