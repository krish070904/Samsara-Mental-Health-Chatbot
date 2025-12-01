import Summary from "../models/Summary.js";

export default async function updateGlobalSummary(userId, userMsg, botMsg) {
  let summary = await Summary.findOne({ userId });

  if (!summary) {
    summary = await Summary.create({
      userId,
      keyPoints: [],
      moodHistory: [],
      lastUpdated: new Date(),
    });
  }

  const text = userMsg.toLowerCase();

  const moodKeywords = ["anxious", "sad", "stressed", "lonely"];
  moodKeywords.forEach((mood) => {
    if (text.includes(mood)) {
      summary.moodHistory.push(mood);
    }
  });

  const topicKeywords = ["work", "family", "relationship", "school"];
  topicKeywords.forEach((topic) => {
    if (text.includes(topic)) {
      summary.keyPoints.push(topic);
    }
  });

  summary.keyPoints = [...new Set(summary.keyPoints)];
  summary.moodHistory = [...new Set(summary.moodHistory)];

  summary.lastUpdated = new Date();
  await summary.save();
}
