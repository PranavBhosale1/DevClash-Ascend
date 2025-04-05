import mongoose from "mongoose";

const TimeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true }, // Store date in 'YYYY-MM-DD' format
  time: { type: Number, required: true, default: 0 }, // Store learning time in seconds
});

const TimeModel = mongoose.models.Time || mongoose.model("Time", TimeSchema);

export default TimeModel;
