import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Post from '@/models/Post';

// GET - Fetch a single post by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Find post by ID
    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Find the post
    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the post creator
    if (post.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Delete the post
    await Post.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting post' },
      { status: 500 }
    );
  }
}

// PATCH - Update a post (for likes and other updates)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Find the post
    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Handle like/unlike action
    if (body.action === 'like') {
      const { userId } = body;
      
      if (!userId) {
        return NextResponse.json(
          { success: false, message: 'User ID is required' },
          { status: 400 }
        );
      }
      
      // Check if user already liked the post
      const alreadyLiked = post.likes.includes(userId);
      
      if (alreadyLiked) {
        // Unlike the post
        post.likes = post.likes.filter((id: string) => id !== userId);
      } else {
        // Like the post
        post.likes.push(userId);
      }
      
      await post.save();
      
      return NextResponse.json({
        success: true,
        message: alreadyLiked ? 'Post unliked successfully' : 'Post liked successfully',
        liked: !alreadyLiked,
        likeCount: post.likes.length
      });
    }
    
    // Handle comment action
    if (body.action === 'comment') {
      const { userId, userName, userImage, content } = body;
      
      if (!userId || !userName || !content) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields for comment' },
          { status: 400 }
        );
      }
      
      // Add new comment
      post.comments.push({
        userId,
        userName,
        userImage,
        content,
        createdAt: new Date()
      });
      
      await post.save();
      
      return NextResponse.json({
        success: true,
        message: 'Comment added successfully',
        commentCount: post.comments.length,
        comment: post.comments[post.comments.length - 1]
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating post' },
      { status: 500 }
    );
  }
} 