import mongoose, { Schema, Document } from 'mongoose';

// Interface for search queries
interface SearchQuery {
  query: string;
}

// Interface for roadmap topics
interface RoadmapTopic {
  name: string;
  queries: string[];
  day?: number;
  position?: number;
}

// Interface for roadmap document
export interface IRoadmap extends Document {
  title: string;
  userId: string;
  description?: string;
  topics: RoadmapTopic[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for the roadmap
const RoadmapSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    description: { type: String },
    topics: [
      {
        name: { type: String, required: true },
        queries: [{ type: String }],
        day: { type: Number },
        position: { type: Number }
      }
    ]
  },
  { timestamps: true }
);

// Create and export the model
export default mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', RoadmapSchema); 