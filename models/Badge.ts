import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
  userId: string;            // Supabase user ID
  badgeId: number;           // Badge identifier
  name: string;              // Badge name
  description: string;       // Badge description
  iconType: string;          // Icon identifier (e.g., "zap", "star")
  earned: boolean;           // Whether the badge is earned
  earnedDate?: Date;         // Date when badge was earned
  progress?: number;         // Current progress (for unearned badges)
  total?: number;            // Total needed to earn (for unearned badges)
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    userId: { type: String, required: true, index: true },
    badgeId: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    iconType: { type: String, required: true },
    earned: { type: Boolean, default: false },
    earnedDate: { type: Date },
    progress: { type: Number },
    total: { type: Number },
  },
  { timestamps: true }
);

// Create a compound index for userId and badgeId to ensure uniqueness
BadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export default mongoose.models.Badge || mongoose.model<IBadge>("Badge", BadgeSchema); 