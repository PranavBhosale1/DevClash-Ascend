// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define Profile Schema and model
const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  profileImage: { type: String, required: true },
  coins: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Handle POST request (create profile)
export async function POST(request: Request) {
  try {
    const { userId, name, profileImage } = await request.json();
    
    if (!userId || !name || !profileImage) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID, name and profile image are required' 
      }, { status: 400 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get or create Profile model
    const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
    
    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId });
    
    if (existingProfile) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile already exists for this user',
        profile: existingProfile,
        exists: true
      });
    }
    
    // Create new profile
    const newProfile = await Profile.create({
      userId,
      name,
      profileImage,
      coins: 0, // Start with 0 coins
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profile created successfully',
      profile: newProfile
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create profile'
    }, { status: 500 });
  }
}

// Handle GET request (fetch profile)
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
    
    // Get Profile model
    const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
    
    // Find profile
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      return NextResponse.json({ 
        success: false, 
        message: 'Profile not found',
        exists: false
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      profile,
      exists: true
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch profile'
    }, { status: 500 });
  }
}

// Handle PUT request (update profile)
export async function PUT(request: Request) {
  try {
    // Parse request body
    const { userId, name, profileImage, coins } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID is required' 
      }, { status: 400 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get Profile model
    const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
    
    // Prepare update object with only provided fields
    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (coins !== undefined) updateData.coins = coins;
    
    // Update profile
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true } // Return the updated document and create if it doesn't exist
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update profile'
    }, { status: 500 });
  }
}