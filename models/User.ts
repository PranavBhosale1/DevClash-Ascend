import mongoose, { Schema, Document } from "mongoose";

interface IVideo {
  videoTitle: string;
  description: string;
  searchQuery: string;
}

interface IUser extends Document {
  supabaseId: string;
  days: {
    dayNumber: number;
    videos: IVideo[];
  }[];
}

const VideoSchema = new Schema<IVideo>({
  videoTitle: { type: String, required: true },
  description: { type: String, required: true },
  searchQuery: { type: String, required: true },
});

const UserSchema = new Schema<IUser>({
  supabaseId: { type: String, required: true, unique: true },
  days: [
    {
      dayNumber: { type: Number, required: true },
      videos: [VideoSchema],
    },
  ],
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
