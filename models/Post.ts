import mongoose, { Document, Schema } from 'mongoose';

// Interface for comments
export interface IComment extends Document {
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: Date;
}

// Interface for posts
export interface IPost extends Document {
  userId: string;
  userName: string;
  userImage?: string;
  batchImage?: string;
  content: string;
  likes: string[]; // Array of user IDs who liked the post
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for comments
const CommentSchema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userImage: { type: String },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Schema for posts
const PostSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userImage: { type: String },
    batchImage: { type: String },
    content: { type: String, required: true },
    likes: [{ type: String }], // Array of user IDs
    comments: [CommentSchema],
  },
  { timestamps: true }
);

// Create and export the model
export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema); 