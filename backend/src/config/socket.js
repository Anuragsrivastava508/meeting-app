


// import { Server } from "socket.io";
// import cookie from "cookie";
// import jwt from "jsonwebtoken";

// let io;

// export const initSocket = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     /* ================= AUTH ================= */
//     try {
//       const cookies = cookie.parse(socket.handshake.headers.cookie || "");
//       const token = cookies.jwt;

//       if (!token) throw new Error("No token");

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       socket.userId = decoded.userId;

//       console.log("✅ Socket user:", socket.userId);

//     } catch (err) {
//       console.log("❌ Unauthorized socket");
//       return socket.disconnect();
//     }

//     console.log("🔥 Connected:", socket.id);

//     /* ================= JOIN ROOM ================= */
//     socket.on("join-room", ({ roomId }) => {
//       socket.join(roomId);

//       const users = Array.from(
//         io.sockets.adapter.rooms.get(roomId) || []
//       );

//       socket.emit("all-users", users);

//       socket.to(roomId).emit("user-joined", {
//         userId: socket.userId,
//         socketId: socket.id,
//       });

//       console.log(`User ${socket.userId} joined room ${roomId}`);
//     });

//     /* ================= WEBRTC ================= */
//     socket.on("webrtc-offer", ({ to, offer }) => {
//       io.to(to).emit("webrtc-offer", {
//         from: socket.id,
//         offer,
//       });
//     });

//     socket.on("webrtc-answer", ({ to, answer }) => {
//       io.to(to).emit("webrtc-answer", {
//         from: socket.id,
//         answer,
//       });
//     });

//     socket.on("webrtc-ice", ({ to, candidate }) => {
//       io.to(to).emit("webrtc-ice", {
//         from: socket.id,
//         candidate,
//       });
//     });

//     /* ================= DISCONNECT ================= */
//     socket.on("disconnect", () => {
//       console.log("❌ Disconnected:", socket.id);
//       socket.broadcast.emit("user-disconnected", socket.id);
//     });
//   });
// };

// export { io };