import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import chatRoutes from "./src/routes/chatRoutes.js";

dotenv.config();

// Connect DB
connectDB();

const app = express();

app.use(cors());

app.use(express.json());



app.get("/", (req, res) => {    
  res.json({ message: "Samsara Backend Running..." });
});

app.use('/api', chatRoutes);


// Port
const PORT = process.env.PORT || 5001; 

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
