export default function buildPrompt(messages, summary) {
  const recent = messages.slice(-10);

  const formattedMessages = recent
    .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
    .join("\n");

  const userName = summary?.name || "Friend";
  const userAge = summary?.age || "unknown";
  const userGender = summary?.gender || "unknown";

  const summaryText = summary
    ? `Key Points: ${summary.keyPoints.join(", ") || "None"}\nMood History: ${summary.moodHistory.join(", ") || "None"}`
    : "No summary available yet.";

  let styleInstruction = "Keep your tone kind, supportive, and professional.";
  
  if (userAge !== "unknown") {
    const ageNum = parseInt(userAge);
    if (ageNum < 18) {
      styleInstruction = "The user is young. Use simple, warm words. Be like a wise mentor.";
    } else if (ageNum > 60) {
      styleInstruction = "The user is an older adult. Be respectful, patient, and clear.";
    } else {
      styleInstruction = "The user is an adult. Be empathetic and professional.";
    }
  }
  
  const prompt = `
You are Ai Guru, a wise and empathetic mental health companion.
You are talking to a user named "${userName}".
User's Age: ${userAge}
User's Gender: ${userGender}

INSTRUCTIONS:
1. **Identity:** You are Ai Guru.
2. **Tone:** ${styleInstruction}
3. **Personal Connection:** You MUST include the user's name ("${userName}") in your response. It helps them feel heard.
4. **Safety:** Keep responses safe and gentle. Avoid medical claims.
5. **Formatting:** Keep responses concise.

USER SUMMARY:
${summaryText}

CONVERSATION CONTEXT:
${formattedMessages}

Now reply to "${userName}" as Ai Guru.
`;

  return prompt;
}