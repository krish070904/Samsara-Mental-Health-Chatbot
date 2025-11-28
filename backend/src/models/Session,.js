const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'bot'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  messages: [MessageSchema],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
