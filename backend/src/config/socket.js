import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { createWebRtcTransport } from "./transport.js";
import { getRouter } from "./mediasoup.js";

let io;

/* ================= GLOBAL STORES ================= */
const transports = {};
const producers = {};
const consumers = {};
const roomMap = {};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    /* ================= AUTH ================= */
  try {
  const rawCookie = socket.handshake.headers.cookie;

  console.log("🍪 Raw Cookie:", rawCookie);

  if (!rawCookie) {
    console.log("❌ No cookie found in socket");
    return socket.disconnect();
  }

  const cookies = cookie.parse(rawCookie);
  const token = cookies.jwt;

  if (!token) {
    console.log("❌ No JWT in cookie");
    return socket.disconnect();
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.userId = decoded.userId;

  console.log("✅ Socket user:", socket.userId);

} catch (err) {
  console.log("❌ Socket auth error:", err.message);
  return socket.disconnect();
}

    console.log("🔥 Connected:", socket.id);

    /* ================= RTP ================= */
    socket.on("get-rtp-capabilities", (callback) => {
      const router = getRouter();
      callback(router.rtpCapabilities);
    });

    /* ================= JOIN ROOM ================= */
    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);
      roomMap[socket.id] = roomId;

      const users = Array.from(
        io.sockets.adapter.rooms.get(roomId) || []
      );

      socket.emit("all-users", users);

      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        userId: socket.userId,
      });

      /* SEND EXISTING PRODUCERS */
      users.forEach((userSocketId) => {
        if (userSocketId === socket.id) return;

        const userProducers = producers[userSocketId] || [];

        userProducers.forEach((producer) => {
          socket.emit("new-producer", {
            producerId: producer.id,
            socketId: userSocketId,
          });
        });
      });

      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    /* ================= PARTICIPANTS ================= */
    socket.on("get-participants", (roomId, callback) => {
      const users = Array.from(
        io.sockets.adapter.rooms.get(roomId) || []
      );

      callback(users);
    });

    /* ================= CREATE TRANSPORT ================= */
    socket.on("create-transport", async (_, callback) => {
      try {
        const transport = await createWebRtcTransport();

        transports[socket.id] = transport;

        callback({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        });

      } catch (err) {
        console.error("❌ Transport error:", err);
      }
    });

    /* ================= CONNECT TRANSPORT ================= */
    socket.on("connect-transport", async ({ dtlsParameters }) => {
      const transport = transports[socket.id];
      await transport.connect({ dtlsParameters });
    });

    /* ================= PRODUCE ================= */
    socket.on("produce", async ({ kind, rtpParameters }, callback) => {
      const transport = transports[socket.id];

      const producer = await transport.produce({
        kind,
        rtpParameters,
      });

      if (!producers[socket.id]) producers[socket.id] = [];
      producers[socket.id].push(producer);

      const roomId = roomMap[socket.id];

      socket.to(roomId).emit("new-producer", {
        producerId: producer.id,
        socketId: socket.id,
      });

      callback({ id: producer.id });

      console.log("🎥 Producer:", kind);
    });

    /* ================= CONSUME ================= */
    socket.on("consume", async ({ rtpCapabilities, producerId }, callback) => {
      try {
        const transport = transports[socket.id];
        const router = getRouter();

        if (!router.canConsume({ producerId, rtpCapabilities })) return;

        const consumer = await transport.consume({
          producerId,
          rtpCapabilities,
          paused: false,
        });

        if (!consumers[socket.id]) consumers[socket.id] = [];
        consumers[socket.id].push(consumer);

        callback({
          id: consumer.id,
          producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });

      } catch (err) {
        console.error("❌ Consume error:", err);
      }
    });

    /* ================= CHAT ================= */
    socket.on("send-message", ({ roomId, message, user }) => {
      socket.to(roomId).emit("receive-message", {
        message,
        user,
        time: new Date(),
      });
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      const roomId = roomMap[socket.id];

      if (roomId) {
        socket.to(roomId).emit("user-left", {
          socketId: socket.id,
        });
      }

      transports[socket.id]?.close();

      producers[socket.id]?.forEach((p) => p.close());
      consumers[socket.id]?.forEach((c) => c.close());

      delete transports[socket.id];
      delete producers[socket.id];
      delete consumers[socket.id];
      delete roomMap[socket.id];

      console.log("❌ Disconnected:", socket.id);
    });
  });
};

export { io };









// import { Server } from "socket.io";
// import cookie from "cookie";
// import jwt from "jsonwebtoken";
// import { createWebRtcTransport } from "./transport.js";
// import { getRouter } from "./mediasoup.js";

// let io;

// /* ================= GLOBAL STORES ================= */
// const transports = {};
// const producers = {};   // socketId -> [producers]
// const consumers = {};   // socketId -> [consumers]
// const roomMap = {};     // socketId -> roomId

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

//     /* ================= RTP CAPABILITIES ================= */
//     socket.on("get-rtp-capabilities", (callback) => {
//       const router = getRouter();
//       callback(router.rtpCapabilities);
//     });

//     /* ================= JOIN ROOM ================= */
//     socket.on("join-room", ({ roomId }) => {
//       socket.join(roomId);
//       roomMap[socket.id] = roomId;

//       const users = Array.from(
//         io.sockets.adapter.rooms.get(roomId) || []
//       );

//       socket.emit("all-users", users);

//       socket.to(roomId).emit("user-joined", {
//         socketId: socket.id,
//         userId: socket.userId,
//       });

//       /* 🔥 SEND EXISTING PRODUCERS (VERY IMPORTANT) */
//       users.forEach((userSocketId) => {
//         if (userSocketId === socket.id) return;

//         const userProducers = producers[userSocketId] || [];

//         userProducers.forEach((producer) => {
//           socket.emit("new-producer", {
//             producerId: producer.id,
//             socketId: userSocketId,
//           });
//         });
//       });

//       console.log(`User ${socket.userId} joined room ${roomId}`);
//     });

//     /* ================= CREATE TRANSPORT ================= */
//     socket.on("create-transport", async (_, callback) => {
//       try {
//         const transport = await createWebRtcTransport();

//         transports[socket.id] = transport;

//         callback({
//           id: transport.id,
//           iceParameters: transport.iceParameters,
//           iceCandidates: transport.iceCandidates,
//           dtlsParameters: transport.dtlsParameters,
//         });

//       } catch (err) {
//         console.error("❌ Transport error:", err);
//       }
//     });

//     /* ================= CONNECT TRANSPORT ================= */
//     socket.on("connect-transport", async ({ dtlsParameters }) => {
//       const transport = transports[socket.id];
//       await transport.connect({ dtlsParameters });

//       console.log("🔗 Transport connected:", socket.id);
//     });

//     /* ================= PRODUCE ================= */
//     socket.on("produce", async ({ kind, rtpParameters }, callback) => {
//       const transport = transports[socket.id];

//       const producer = await transport.produce({
//         kind,
//         rtpParameters,
//       });

//       if (!producers[socket.id]) producers[socket.id] = [];
//       producers[socket.id].push(producer);

//       const roomId = roomMap[socket.id];

//       // notify others
//       socket.to(roomId).emit("new-producer", {
//         producerId: producer.id,
//         socketId: socket.id,
//       });

//       callback({ id: producer.id });

//       console.log("🎥 Producer created:", kind, socket.id);
//     });

//     /* ================= CONSUME ================= */
//     socket.on("consume", async ({ rtpCapabilities, producerId }, callback) => {
//       try {
//         const transport = transports[socket.id];
//         const router = getRouter();

//         if (!router.canConsume({ producerId, rtpCapabilities })) {
//           console.log("❌ Cannot consume");
//           return;
//         }

//         const consumer = await transport.consume({
//           producerId,
//           rtpCapabilities,
//           paused: false,
//         });

//         if (!consumers[socket.id]) consumers[socket.id] = [];
//         consumers[socket.id].push(consumer);

//         callback({
//           id: consumer.id,
//           producerId,
//           kind: consumer.kind,
//           rtpParameters: consumer.rtpParameters,
//         });

//         console.log("📺 Consumer created:", socket.id);

//       } catch (err) {
//         console.error("❌ Consume error:", err);
//       }
//     });

    
//     /* ================= DISCONNECT ================= */
//     socket.on("disconnect", () => {
//       const roomId = roomMap[socket.id];

//       if (roomId) {
//         socket.to(roomId).emit("user-left", {
//           socketId: socket.id,
//         });
//       }

//       /* 🔥 CLEANUP */
//       transports[socket.id]?.close();

//       producers[socket.id]?.forEach((p) => p.close());
//       consumers[socket.id]?.forEach((c) => c.close());

//       delete transports[socket.id];
//       delete producers[socket.id];
//       delete consumers[socket.id];
//       delete roomMap[socket.id];

//       console.log("❌ Disconnected:", socket.id);
//     });
//   });
// };

// export { io };


// // import { Server } from "socket.io";
// // import cookie from "cookie";
// // import jwt from "jsonwebtoken";

// // let io;

// // export const initSocket = (server) => {
// //   io = new Server(server, {
// //     cors: {
// //       origin: "http://localhost:5173",
// //       credentials: true,
// //     },
// //   });

// //   io.on("connection", (socket) => {
// //     /* ================= AUTH ================= */
// //     try {
// //       const cookies = cookie.parse(socket.handshake.headers.cookie || "");
// //       const token = cookies.jwt;

// //       if (!token) throw new Error("No token");

// //       const decoded = jwt.verify(token, process.env.JWT_SECRET);

// //       socket.userId = decoded.userId;

// //       console.log("✅ Socket user:", socket.userId);

// //     } catch (err) {
// //       console.log("❌ Unauthorized socket");
// //       return socket.disconnect();
// //     }

// //     console.log("🔥 Connected:", socket.id);

// //     /* ================= JOIN ROOM ================= */
// //     socket.on("join-room", ({ roomId }) => {
// //       socket.join(roomId);

// //       const users = Array.from(
// //         io.sockets.adapter.rooms.get(roomId) || []
// //       );

// //       socket.emit("all-users", users);

// //       socket.to(roomId).emit("user-joined", {
// //         userId: socket.userId,
// //         socketId: socket.id,
// //       });

// //       console.log(`User ${socket.userId} joined room ${roomId}`);
// //     });

// //     /* ================= WEBRTC ================= */
// //     socket.on("webrtc-offer", ({ to, offer }) => {
// //       io.to(to).emit("webrtc-offer", {
// //         from: socket.id,
// //         offer,
// //       });
// //     });

// //     socket.on("webrtc-answer", ({ to, answer }) => {
// //       io.to(to).emit("webrtc-answer", {
// //         from: socket.id,
// //         answer,
// //       });
// //     });

// //     socket.on("webrtc-ice", ({ to, candidate }) => {
// //       io.to(to).emit("webrtc-ice", {
// //         from: socket.id,
// //         candidate,
// //       });
// //     });

// //     /* ================= DISCONNECT ================= */
// //     socket.on("disconnect", () => {
// //       console.log("❌ Disconnected:", socket.id);
// //       socket.broadcast.emit("user-disconnected", socket.id);
// //     });
// //   });
// // };

// // export { io };

