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
import { createMediasoupWorker, createRouter } from "./config/mediasoup.js";
import { corsOptions } from "./config/cors.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

app.get("/", (_, res) => res.send("Backend running ✅"));
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/meeting", meetingRoutes);

const PORT = process.env.PORT || 5001; // ✅ 5001 default

const server = http.createServer(app);
initSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    await createMediasoupWorker();
    await createRouter();
    console.log("🔥 Mediasoup ready");

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `\n❌ Port ${PORT} is already in use.\n` +
            `   → Close the other backend terminal, OR run:\n` +
            `   → netstat -ano | findstr :${PORT}\n` +
            `   → taskkill /PID <pid> /F\n`
        );
        process.exit(1);
      }
      console.error("❌ Server error:", err);
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server running: http://localhost:${PORT}`);
      console.log(`   API: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
};

startServer();

// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import http from "http";
// import { initSocket } from "./config/socket.js"; 
// import { connectDB } from "./config/db.js";

// // routes
// import authRoutes from "./routes/auth.route.js";
// import messageRoutes from "./routes/message.route.js";
// import meetingRoutes from "./routes/meeting.route.js";

// import { createMediasoupWorker, createRouter } from "./config/mediasoup.js";



// dotenv.config();

// const app = express();

// /* ================= MIDDLEWARE ================= */
//  app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));
// app.use(cookieParser());


// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
// }));




// /* ================= ROUTES ================= */
// app.get("/", (req, res) => {
//   res.send("Backend running ✅");
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/message", messageRoutes);
// app.use("/api/meeting", meetingRoutes);

// /* ================= SERVER ================= */
// const PORT = process.env.PORT || 5000;

// const server = http.createServer(app);

// /* ================= SOCKET ================= */
// initSocket(server);
// console.log("✅ Socket initialized");

// /* ================= START ================= */
// const startServer = async () => {
//   try {
//     await connectDB();
//     console.log("✅ DB Connected");

//     // ✅ ADD HERE (correct place)
//     await createMediasoupWorker();
//     await createRouter();
//     console.log("🔥 Mediasoup initialized");

//     server.listen(PORT, () => {
//       console.log(`🚀 Server running on http://localhost:${PORT}`);
//     });

//   } catch (error) {
//     console.error("❌ Server error:", error);
//   }
// };


// startServer();
