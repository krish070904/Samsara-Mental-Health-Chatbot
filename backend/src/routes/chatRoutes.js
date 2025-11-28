import axios from "axios";
import express from "express";
import Session from "../models/Session.js";
import Summary from "../models/Summary.js";

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

  const contextMessages = session.messages.slice(-10);

  const userSummary = await Summary.findOne({ userId });

  const prompt = [];

  if (userSummary) {
    prompt.push({
      role: "system",
      content: `User Summary: ${userSummary.summaryText}`,
    });
  }

  contextMessages.forEach((msg) => {
    prompt.push({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    });
  });

  let response;
  try {
    response = await axios.post("YOUR_NGROK_URL", {
      messages: prompt,
    });
  } catch (err) {
    return res.json({ error: err.message });
  }

  const botReply =
    response.data.reply ||
    response.data.message ||
    response.data.output ||
    response.data?.choices?.[0]?.message?.content ||
    "Model returned no response.";

  session.messages.push({
    sender: "bot",
    text: botReply,
    timestamp: new Date(),
  });

  session.lastUpdated = new Date();
  await session.save();

  console.log("Prompt sent to model:", prompt);

  res.json({ reply: botReply });
});

export default router;
