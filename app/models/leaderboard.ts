import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  coins: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  previousRank: {
    type: Number,
    default: null,
  },
  currentRank: {
    type: Number,
    default: null,
  },
  rankChange: {
    type: String,
    enum: ['up', 'down', 'same', null],
    default: null,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Create index for better query performance
leaderboardSchema.index({ coins: -1 });

export const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema, 'leaderboards'); 