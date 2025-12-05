import axios from "axios";
import express from "express";
import Session from "../models/Session.js";
import Summary from "../models/Summary.js";
import updateGlobalSummary from "../utils/updateGlobalSummary.js";
import buildPrompt from "../utils/buildPrompt.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { userId, message, name, age, gender } = req.body;

  console.log("👤 Incoming Profile:", { name, age, gender });

  if (name || age || gender) {
    let summary = await Summary.findOne({ userId });
    if (!summary) {
      summary = new Summary({ userId });
    }
    if (name) summary.name = name;
    if (age) summary.age = age;
    if (gender) summary.gender = gender;
    await summary.save();
  }

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

    response = await axios.post("https://nonzonated-victoria-hilariously.ngrok-free.dev/generate", {
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    console.error("AI Model Error:", err.message);
    return res.status(500).json({ error: err.message });
  }


  let rawResponse =
    response.data.response ||
    response.data.reply ||
    response.data.message ||
    response.data.output ||
    response.data.text ||
    (typeof response.data === 'string' ? response.data : null) ||
    "Model returned no response.";

  let botReply = rawResponse;
  

  const separators = [
    "Now reply to the user's most recent message",
    "Now reply to the user",
    "CONVERSATION CONTEXT:",
  ];
  
  for (const separator of separators) {
    const index = rawResponse.lastIndexOf(separator);
    if (index !== -1) {
      botReply = rawResponse.substring(index + separator.length).trim();
      break;
    }
  }


  botReply = botReply.replace(/^(Ai Guru:|Assistant:|AI:|Bot:)/i, "").trim();

  
  if (botReply.includes("You are Ai Guru")) {
    const lines = botReply.split('\n');
    botReply = lines
      .filter(line => line.trim() && 
              !line.includes("You are Ai Guru") && 
              !line.includes("USER SUMMARY") && 
              !line.includes("CONVERSATION CONTEXT"))
      .join('\n')
      .trim();
  }

 
  botReply = botReply.replace(/([^\w\s,.?!'"]\s*){3,}/g, "");

  session.messages.push({
    sender: "bot",
    text: botReply,
    timestamp: new Date(),
  });

  await session.save();
  await updateGlobalSummary(userId, message, botReply);

  res.json({ reply: botReply });
});

export default router;