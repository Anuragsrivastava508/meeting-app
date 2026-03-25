import { Server } from "socket.io";

let io;

/* ================= USER → SOCKET MAP ================= */
const userSocketMap = {};

export const getReceiverSocketIds = (userId) => {
  return userSocketMap[userId];
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔥 Socket connected:", socket.id);

    const userId = socket.handshake.query.userId;

    /* ================= STORE USER SOCKET ================= */
    if (userId) {
      if (!userSocketMap[userId]) {
        userSocketMap[userId] = new Set();
      }
      userSocketMap[userId].add(socket.id);
    }

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      if (userId && userSocketMap[userId]) {
        userSocketMap[userId].delete(socket.id);

        if (userSocketMap[userId].size === 0) {
          delete userSocketMap[userId];
        }
      }
    });

    /* ================= MEETING ROOM ================= */
    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", socket.id);
    });

    /* ================= WEBRTC ================= */
    socket.on("webrtc-offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("webrtc-offer", offer);
    });

    socket.on("webrtc-answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("webrtc-answer", answer);
    });

    socket.on("webrtc-ice", ({ roomId, candidate }) => {
      socket.to(roomId).emit("webrtc-ice", candidate);
    });
  });
};

export { io };