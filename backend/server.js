import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import chatRoutes from './src/routes/chat.js';




dotenv.config();

// Connect DB
connectDB();

const app = express();



app.get("/", (req, res) => {    
  res.json({ message: "Samsara Backend Running..." });
});

app.use('/api', chatRoutes);


// Port
const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
