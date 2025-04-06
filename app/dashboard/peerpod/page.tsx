"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, Trash2, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useInView } from "react-intersection-observer";

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  userId: string;
  userName: string;
  userImage?: string;
  batchImage?: string;
  content: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export default function PeerPodPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [batchImage, setBatchImage] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // For infinite scroll
  const { ref, inView } = useInView();

  // Initial load of posts
  useEffect(() => {
    fetchPosts(1);
  }, []);

  // Load more when reaching bottom
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      loadMorePosts();
    }
  }, [inView, hasMore, isLoadingMore]);

  // Fetch posts with pagination
  const fetchPosts = async (pageNumber: number) => {
    try {
      const response = await fetch(`/api/peerpod/posts?page=${pageNumber}&limit=5`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch posts');
      }
      
      if (pageNumber === 1) {
        setPosts(data.data);
      } else {
        setPosts(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.pagination.page < data.pagination.pages);
      setIsLoadingMore(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
      setIsLoadingMore(false);
    }
  };

  // Load more posts
  const loadMorePosts = () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  // Handle batch image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setBatchImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit a new post
  const handleSubmitPost = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPostContent.trim()) {
      toast({
        title: "Empty post",
        description: "Please write something for your post",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/peerpod/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userName: user.email?.split('@')[0] || 'Anonymous',
          userImage: user.user_metadata?.avatar_url,
          batchImage: batchImage,
          content: newPostContent
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create post');
      }
      
      // Add new post to the beginning of the list
      setPosts(prev => [data.data, ...prev]);
      setNewPostContent("");
      setBatchImage(null);
      
      toast({
        title: "Success",
        description: "Your post has been published!",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to publish post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like/unlike post
  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/peerpod/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'like',
          userId: user.id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to like post');
      }
      
      // Update the posts state with the new like status
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              likes: data.liked 
                ? [...post.likes, user.id] 
                : post.likes.filter(id => id !== user.id) 
            } 
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding a comment
  const handleAddComment = async (postId: string, commentContent: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }
    
    if (!commentContent.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something for your comment",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/peerpod/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'comment',
          userId: user.id,
          userName: user.email?.split('@')[0] || 'Anonymous',
          userImage: user.user_metadata?.avatar_url,
          content: commentContent,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add comment');
      }
      
      // Update the posts state with the new comment
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              comments: [...post.comments, data.comment] 
            } 
          : post
      ));
      
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Handle deleting a post
  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/peerpod/posts/${postId}?userId=${user.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete post');
      }
      
      // Remove the post from state
      setPosts(prev => prev.filter(post => post._id !== postId));
      
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Peer Pod</h1>
      <p className="text-muted-foreground mb-8">
        Share your batches, perks, and connect with others in your community.
      </p>
      
      {/* Create Post Card */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <h2 className="text-xl font-bold">Create a Post</h2>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Share something with the community..."
            className="min-h-20 mb-3"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
          
          {batchImage && (
            <div className="relative w-full h-48 mb-3">
              <Image
                src={batchImage}
                alt="Batch preview"
                fill
                className="object-contain rounded-md"
              />
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2"
                onClick={() => setBatchImage(null)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" asChild>
              <label>
                <Upload size={16} />
                <span>Add Batch Image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </label>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            disabled={isSubmitting || !newPostContent.trim()} 
            onClick={handleSubmitPost}
          >
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground text-center">
                No posts yet. Be the first to share something!
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={user}
              onLike={() => handleLikePost(post._id)}
              onAddComment={handleAddComment}
              onDelete={() => handleDeletePost(post._id)}
            />
          ))
        )}
        
        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <p className="text-muted-foreground">Loading more posts...</p>
          </div>
        )}
        
        {/* Intersection observer target */}
        {hasMore && !isLoadingMore && (
          <div ref={ref} className="h-10" />
        )}
        
        {!hasMore && posts.length > 0 && (
          <p className="text-muted-foreground text-center py-4">
            You've reached the end of the feed.
          </p>
        )}
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ 
  post, 
  currentUser,
  onLike,
  onAddComment,
  onDelete
}: { 
  post: Post; 
  currentUser: any;
  onLike: () => void;
  onAddComment: (postId: string, content: string) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isAuthor = currentUser && post.userId === currentUser.id;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleSubmitComment = async () => {
    setIsSubmittingComment(true);
    const success = await onAddComment(post._id, commentContent);
    if (success) {
      setCommentContent("");
    }
    setIsSubmittingComment(false);
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.userImage} />
            <AvatarFallback>{post.userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{post.userName}</h3>
            <p className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        {isAuthor && (
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 size={16} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        <p className="whitespace-pre-wrap">{post.content}</p>
        
        {post.batchImage && (
          <div className="relative w-full h-64 mt-3">
            <Image
              src={post.batchImage}
              alt="Batch image"
              fill
              className="object-contain rounded-md"
            />
          </div>
        )}
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={isLiked ? "text-red-500" : ""}
              onClick={onLike}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </Button>
            <span className="text-sm">{post.likes.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle size={18} />
            </Button>
            <span className="text-sm">{post.comments.length}</span>
          </div>
        </div>
      </CardContent>
      
      {showComments && (
        <CardFooter className="flex flex-col items-start pt-0">
          <div className="w-full border-t my-2"></div>
          
          {/* Comments list */}
          {post.comments.length > 0 ? (
            <div className="w-full space-y-3 mb-3">
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.userImage} />
                    <AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted p-2 rounded-md">
                      <p className="text-sm font-semibold">{comment.userName}</p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-3">No comments yet. Be the first to comment!</p>
          )}
          
          {/* Add comment form */}
          {currentUser && (
            <div className="flex w-full gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.user_metadata?.avatar_url} />
                <AvatarFallback>{currentUser.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-muted rounded-md px-3 py-2 text-sm"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && commentContent.trim()) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                />
                <Button 
                  size="icon" 
                  disabled={isSubmittingComment || !commentContent.trim()}
                  onClick={handleSubmitComment}
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
} 