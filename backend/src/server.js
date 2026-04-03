import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { initSocket } from "./config/socket.js"; 
import { connectDB } from "./config/db.js";

// routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import meetingRoutes from "./routes/meeting.route.js";

import { createMediasoupWorker, createRouter } from "./config/mediasoup.js";



dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */
 app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));




/* ================= ROUTES ================= */
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/meeting", meetingRoutes);

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

/* ================= SOCKET ================= */
initSocket(server);
console.log("✅ Socket initialized");

/* ================= START ================= */
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ DB Connected");

    // ✅ ADD HERE (correct place)
    await createMediasoupWorker();
    await createRouter();
    console.log("🔥 Mediasoup initialized");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server error:", error);
  }
};


startServer();
