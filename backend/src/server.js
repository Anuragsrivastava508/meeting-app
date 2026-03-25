
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { initSocket } from "./config/socket.js"; 
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import meetingRoutes from "./routes/meeting.route.js";


dotenv.config();
const app = express();
// 🔹 Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",  
  credentials: true,              
}));


// 🔹 Test route

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/meeting", meetingRoutes);

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);   
initSocket(server);                      

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {          
      console.log(`🚀 Server running on PORT: ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server", error);
  }
};

startServer();
