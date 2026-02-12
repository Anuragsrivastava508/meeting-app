
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
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
  credentials: true
}));


// 🔹 Test route

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/meeting", meetingRoutes);
// 

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {

    app.listen(PORT, () => {
      console.log(`Server running on PORT: ${PORT}`);
    });
    
        await connectDB();
  } catch (error) {
    console.error("Failed to start server", error);
  }
};

// 🔥 THIS WAS MISSING
startServer();

// app.use(cookieParser());

// // 🔥 CORS (localhost + your Render frontend)
// // app.use(
// //   cors({
// //     origin: [
// //       "http://localhost:5173",
// //       "https://chatifys.onrender.com"   // <-- your frontend URL
// //     ],
// //     credentials: true,
// //   })
// // );

// // 🔥 API Routes
// app.use("/api/messages", messageRoutes);

// // ❌ REMOVE FRONTEND SERVE BLOCK
// // Because frontend is deployed separately on Render Static Site
// // This block was causing ENOENT errors for missing dist folder.

// server.listen(PORT, () => {
//   console.log("server is running on PORT:" + PORT);
//   connectDB();
// });