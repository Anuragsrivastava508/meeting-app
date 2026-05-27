import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { createWebRtcTransport } from "./transport.js";
import { getRouter } from "./mediasoup.js";
import { allowedOrigins } from "./cors.js";

let io;

const sendTransports = {};       // socketId -> transport
const recvTransports = {};       // transportId -> transport
const socketToRecvId = {};       // socketId -> transportId
const producers = {};            // socketId -> [producer]
const consumers = {};            // socketId -> [consumer]
const roomMap = {};              // socketId -> roomId

const getRoomParticipants = (roomId) => {
  const socketIds = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
  return socketIds
    .filter((sid) => io.sockets.sockets.has(sid))
    .map((sid) => {
      const s = io.sockets.sockets.get(sid);
      return {
        socketId: sid,
        userId: s?.userId ?? null,
        fullName: s?.fullName ?? "Guest",
        profilePic: s?.profilePic ?? "",
      };
    });
};

const broadcastParticipants = (roomId) => {
  if (!roomId) return;
  io.to(roomId).emit("room-participants", getRoomParticipants(roomId));
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  io.on("connection", async (socket) => {

    /* AUTH */
    try {
      const raw = socket.handshake.headers.cookie;
      if (!raw) return socket.disconnect();
      const { jwt: token } = cookie.parse(raw);
      if (!token) return socket.disconnect();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("fullName profilePic");
      if (!user) return socket.disconnect();
      socket.userId = decoded.userId;
      socket.fullName = user.fullName;
      socket.profilePic = user.profilePic || "";
      console.log("✅ Socket auth:", socket.fullName);
    } catch (e) {
      console.log("❌ Auth error:", e.message);
      return socket.disconnect();
    }

    console.log("🔥 Connected:", socket.id);

    /* RTP CAPABILITIES */
    socket.on("get-rtp-capabilities", (cb) => cb(getRouter().rtpCapabilities));

    /* JOIN ROOM */
    socket.on("join-room", ({ roomId }, cb) => {
      if (!roomId) {
        cb?.({ ok: false, error: "roomId required" });
        return;
      }

      const previousRoom = roomMap[socket.id];

      if (previousRoom && previousRoom !== roomId) {
        socket.leave(previousRoom);
      }

      socket.join(roomId);
      roomMap[socket.id] = roomId;

      const users = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

      if (previousRoom !== roomId) {
        socket.to(roomId).emit("user-joined", {
          socketId: socket.id,
          fullName: socket.fullName,
        });
      }

      // Send existing producers to the joining user
      users.forEach((uid) => {
        if (uid === socket.id) return;
        const peerSocket = io.sockets.sockets.get(uid);
        (producers[uid] || []).forEach((p) => {
          socket.emit("new-producer", {
            producerId: p.id,
            socketId: uid,
            fullName: peerSocket?.fullName || "Guest",
          });
        });
      });

      const list = getRoomParticipants(roomId);
      socket.emit("room-participants", list);
      io.to(roomId).emit("room-participants", list);
      console.log(`✅ ${socket.fullName} joined ${roomId} (${list.length} in room)`);
      cb?.({ ok: true, roomId, participants: list });
    });

    /* LEAVE ROOM */
    socket.on("leave-room", () => {
      const roomId = roomMap[socket.id];
      if (!roomId) return;
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", { socketId: socket.id });
      delete roomMap[socket.id];
      broadcastParticipants(roomId);
    });

    /* PARTICIPANTS */
    socket.on("get-participants", (roomId, cb) => {
      cb(getRoomParticipants(roomId));
    });

    /* CREATE TRANSPORT */
    socket.on("create-transport", async ({ direction = "send" }, cb) => {
      try {
        const transport = await createWebRtcTransport();

        if (direction === "send") {
          sendTransports[socket.id] = transport;
        } else {
          // ✅ Store by transportId — prevents overwrite when consuming multiple producers
          recvTransports[transport.id] = transport;
          socketToRecvId[socket.id] = transport.id;
        }

        cb({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        });
      } catch (err) {
        console.error("❌ create-transport:", err.message);
        cb?.({ error: err.message });
      }
    });

    /* CONNECT TRANSPORT */
    socket.on("connect-transport", async ({ dtlsParameters, direction = "send", transportId }) => {
      let transport;
      if (direction === "send") {
        transport = sendTransports[socket.id];
      } else {
        // use explicit transportId if provided, fallback to latest
        transport = recvTransports[transportId] || recvTransports[socketToRecvId[socket.id]];
      }
      if (transport) await transport.connect({ dtlsParameters });
    });

    /* PRODUCE */
    socket.on("produce", async ({ kind, rtpParameters }, cb) => {
      try {
        const transport = sendTransports[socket.id];
        if (!transport) return cb({ error: "No send transport" });

        const producer = await transport.produce({ kind, rtpParameters });
        if (!producers[socket.id]) producers[socket.id] = [];
        producers[socket.id].push(producer);

        const roomId = roomMap[socket.id];
        if (roomId) {
          socket.to(roomId).emit("new-producer", {
            producerId: producer.id,
            socketId: socket.id,
            fullName: socket.fullName,
          });
        }

        cb({ id: producer.id });
        console.log("🎥 Producer:", kind, socket.fullName);
      } catch (err) {
        console.error("❌ produce:", err.message);
        cb({ error: err.message });
      }
    });

    /* CONSUME */
  socket.on("consume", async ({ rtpCapabilities, producerId }, cb) => {
  try {
    const router = getRouter();

    const transportId = socketToRecvId[socket.id];
    const transport = recvTransports[transportId];

    if (!transport) {
      console.log("❌ No recv transport for", socket.id);
      return cb({});
    }

    if (!router.canConsume({ producerId, rtpCapabilities })) {
      console.log("❌ Cannot consume", producerId);
      return cb({});
    }

    // ✅ FIXED
    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: true,
    });

    // ✅ IMPORTANT
    await consumer.resume();

    if (!consumers[socket.id]) {
      consumers[socket.id] = [];
    }

    consumers[socket.id].push(consumer);

    cb({
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    });

    console.log("📺 Consumer:", consumer.kind, socket.id);

  } catch (err) {
    console.error("❌ consume:", err.message);
    cb({});
  }
});
    /* CHAT */
    socket.on("send-message", ({ message, roomId: clientRoomId }) => {
      if (!message?.trim()) return;

      let roomId = roomMap[socket.id];

      // Auto-join if socket connected but room was lost (reconnect / strict mode)
      if (!roomId && clientRoomId) {
        socket.join(clientRoomId);
        roomMap[socket.id] = clientRoomId;
        roomId = clientRoomId;
        const list = getRoomParticipants(roomId);
        socket.emit("room-participants", list);
        io.to(roomId).emit("room-participants", list);
        console.log(`✅ ${socket.fullName} auto-joined ${roomId} (chat)`);
      }

      if (!roomId) {
        console.log("⚠️ Chat failed — not in room:", socket.fullName);
        return;
      }

      const payload = {
        message: message.trim(),
        user: socket.fullName || "User",
        socketId: socket.id,
        time: new Date(),
      };

      socket.to(roomId).emit("receive-message", payload);
      console.log(`💬 ${socket.fullName} → room ${roomId}: ${payload.message}`);
    });

    /* DISCONNECT */
    socket.on("disconnect", () => {
      const roomId = roomMap[socket.id];
      if (roomId) {
        socket.to(roomId).emit("user-left", { socketId: socket.id });
        setTimeout(() => broadcastParticipants(roomId), 50);
      }

      sendTransports[socket.id]?.close();
      const recvId = socketToRecvId[socket.id];
      if (recvId) recvTransports[recvId]?.close();

      producers[socket.id]?.forEach((p) => p.close());
      consumers[socket.id]?.forEach((c) => c.close());

      delete sendTransports[socket.id];
      delete recvTransports[recvId];
      delete socketToRecvId[socket.id];
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
// const producers = {};
// const consumers = {};
// const roomMap = {};

// export const initSocket = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {

//     /* ================= AUTH ================= */
//   try {
//   const rawCookie = socket.handshake.headers.cookie;

//   console.log("🍪 Raw Cookie:", rawCookie);

//   if (!rawCookie) {
//     console.log("❌ No cookie found in socket");
//     return socket.disconnect();
//   }

//   const cookies = cookie.parse(rawCookie);
//   const token = cookies.jwt;

//   if (!token) {
//     console.log("❌ No JWT in cookie");
//     return socket.disconnect();
//   }

//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   socket.userId = decoded.userId;

//   console.log("✅ Socket user:", socket.userId);

// } catch (err) {
//   console.log("❌ Socket auth error:", err.message);
//   return socket.disconnect();
// }

//     console.log("🔥 Connected:", socket.id);

//     /* ================= RTP ================= */
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

//       /* SEND EXISTING PRODUCERS */
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

//     /* ================= PARTICIPANTS ================= */
//     socket.on("get-participants", (roomId, callback) => {
//       const users = Array.from(
//         io.sockets.adapter.rooms.get(roomId) || []
//       );

//       callback(users);
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

//       socket.to(roomId).emit("new-producer", {
//         producerId: producer.id,
//         socketId: socket.id,
//       });

//       callback({ id: producer.id });

//       console.log("🎥 Producer:", kind);
//     });

//     /* ================= CONSUME ================= */
//     socket.on("consume", async ({ rtpCapabilities, producerId }, callback) => {
//       try {
//         const transport = transports[socket.id];
//         const router = getRouter();

//         if (!router.canConsume({ producerId, rtpCapabilities })) return;

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

//       } catch (err) {
//         console.error("❌ Consume error:", err);
//       }
//     });

//     /* ================= CHAT ================= */
//     socket.on("send-message", ({ roomId, message, user }) => {
//       socket.to(roomId).emit("receive-message", {
//         message,
//         user,
//         time: new Date(),
//       });
//     });

//     /* ================= DISCONNECT ================= */
//     socket.on("disconnect", () => {
//       const roomId = roomMap[socket.id];

//       if (roomId) {
//         socket.to(roomId).emit("user-left", {
//           socketId: socket.id,
//         });
//       }

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

