import mongoose from "mongoose";

const SummarySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  
  name: { type: String, default: "Friend" },
  age: { type: String, default: "unknown" }, 
  gender: { type: String, default: "unknown" },

  keyPoints: { type: [String], default: [] }, 
  moodHistory: { type: [String], default: [] }, 
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.model("Summary", SummarySchema);