export default function buildPrompt(messages, summary) {
  const recent = messages.slice(-10);

  const formattedMessages = recent
    .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
    .join("\n");

  const summaryText = summary
    ? `Key Points: ${summary.keyPoints.join(", ") || "None"}\nMood History: ${summary.moodHistory.join(", ") || "None"}`
    : "No summary available yet.";

  const prompt = `
You are a supportive and empathetic mental health assistant.
Keep responses safe, gentle, and helpful.
Avoid medical claims.

USER SUMMARY:
${summaryText}

CONVERSATION CONTEXT:
${formattedMessages}

Now reply to the user's most recent message in a kind, helpful, and non-judgmental way.
`;

  return prompt;
}
