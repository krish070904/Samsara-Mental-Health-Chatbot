import axios from "axios";
import express from "express";
import Session from "../models/Session.js";
import Summary from "../models/Summary.js";
import updateGlobalSummary from "../utils/updateGlobalSummary.js";
import buildPrompt from "../utils/buildPrompt.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { userId, message } = req.body;

  let session = await Session.findOne({ userId });
  if (!session) {
    session = new Session({ userId, messages: [] });
  }

  session.messages.push({
    sender: "user",
    text: message,
    timestamp: new Date(),
  });

  const userSummary = await Summary.findOne({ userId });

  const prompt = buildPrompt(session.messages, userSummary);

  let response;
  try {
    response = await axios.post("https://proctodeal-furcately-teresa.ngrok-free.dev/chat", {
      message: prompt,
    });
  } catch (err) {
    console.error("❌ AI Model Error:", err.message);
    return res.status(500).json({ error: err.message });
  }

  console.log("📥 AI Model Response:", JSON.stringify(response.data, null, 2));

  let rawResponse =
    response.data.response ||
    response.data.reply ||
    response.data.message ||
    response.data.output ||
    response.data.text ||
    response.data?.choices?.[0]?.message?.content ||
    (typeof response.data === 'string' ? response.data : null) ||
    "Model returned no response.";

  let botReply = rawResponse;
  
  const separators = [
    "Now reply to the user's most recent message in a kind, helpful, and non-judgmental way.\n",
    "Now reply to the user's most recent message",
    "CONVERSATION CONTEXT:",
  ];
  
  for (const separator of separators) {
    const index = rawResponse.lastIndexOf(separator);
    if (index !== -1) {
      botReply = rawResponse.substring(index + separator.length).trim();
      break;
    }
  }
  
  if (botReply.includes("You are a supportive and empathetic mental health assistant")) {
    const lines = botReply.split('\n');
    const actualReply = lines
      .filter(line => line.trim() && 
              !line.includes("You are a supportive") && 
              !line.includes("USER SUMMARY") &&
              !line.includes("CONVERSATION CONTEXT") &&
              !line.includes("Keep responses safe") &&
              !line.includes("Avoid medical claims"))
      .join('\n')
      .trim();
    
    if (actualReply) {
      botReply = actualReply;
    }
  }

  console.log("✅ Extracted Bot Reply:", botReply);

  session.messages.push({
    sender: "bot",
    text: botReply,
    timestamp: new Date(),
  });

  session.messages = session.messages.slice(-50);
  session.lastUpdated = new Date();
  await session.save();

  await updateGlobalSummary(userId, message, botReply);

  res.json({ reply: botReply });
});

export default router;
