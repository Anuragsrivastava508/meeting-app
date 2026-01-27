

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";

dotenv.config();
const app = express();

// 🔹 Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(cors());

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

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
// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);

// // ❌ REMOVE FRONTEND SERVE BLOCK
// // Because frontend is deployed separately on Render Static Site
// // This block was causing ENOENT errors for missing dist folder.

// server.listen(PORT, () => {
//   console.log("server is running on PORT:" + PORT);
//   connectDB();
// });