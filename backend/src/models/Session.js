import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  messages: [MessageSchema],
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Session', SessionSchema);
