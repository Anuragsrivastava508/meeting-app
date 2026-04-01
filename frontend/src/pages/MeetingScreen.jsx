// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import { Device } from "mediasoup-client";
// import { useParams, useNavigate } from "react-router-dom";
// import { axiosInstance } from "../lib/axios";

// export default function MeetingScreen() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const socketRef = useRef(null);
//   const deviceRef = useRef(null);
//   const sendTransportRef = useRef(null);

//   const localVideo = useRef(null);
//   const localStreamRef = useRef(null);

//   const consumersRef = useRef({});
//   const [remoteStreams, setRemoteStreams] = useState([]);

//   /* CHAT */
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [showChat, setShowChat] = useState(true);

//   /* FEATURES */
//   const [isMuted, setIsMuted] = useState(false);
//   const [isCameraOff, setIsCameraOff] = useState(false);
//   const [participants, setParticipants] = useState([]);

//   const socketBaseUrl =
//     axiosInstance.defaults.baseURL.replace(/\/api$/, "");

//   useEffect(() => {
//     const start = async () => {
//      const socket = io(socketBaseUrl, {
//     withCredentials: true,
//     transports: ["websocket"],
//     reconnection: true,
//         });

//       socketRef.current = socket;

//       /* LOCAL STREAM */
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       localStreamRef.current = stream;
//       localVideo.current.srcObject = stream;

//       socket.on("connect", () => {
//         socket.emit("join-room", { roomId: id });

//         refreshParticipants();

//         socket.emit("get-rtp-capabilities", async (rtpCapabilities) => {
//           const device = new Device();
//           await device.load({ routerRtpCapabilities: rtpCapabilities });

//           deviceRef.current = device;

//           createSendTransport(stream);
//         });
//       });

//       socket.on("user-joined", refreshParticipants);
//       socket.on("user-left", refreshParticipants);

//       socket.on("new-producer", ({ producerId }) => {
//         if (!consumersRef.current[producerId]) {
//           consumeStream(producerId);
//         }
//       });

//       socket.on("receive-message", (msg) => {
//         setMessages((prev) => [...prev, msg]);
//       });
//     };

//     start();

//     /* 🔥 CLEANUP */
//     return () => {
//       socketRef.current?.disconnect();

//       Object.values(consumersRef.current).forEach((c) => c.close());

//       localStreamRef.current?.getTracks().forEach((t) => t.stop());

//       setRemoteStreams([]);
//     };
//   }, [id]);

//   const refreshParticipants = () => {
//     socketRef.current?.emit("get-participants", id, (users) => {
//       setParticipants(users);
//     });
//   };

//   /* SEND TRANSPORT */
//   const createSendTransport = (stream) => {
//     const socket = socketRef.current;
//     const device = deviceRef.current;

//     socket.emit("create-transport", {}, async (params) => {
//       const transport = device.createSendTransport(params);
//       sendTransportRef.current = transport;

//       transport.on("connect", ({ dtlsParameters }, callback) => {
//         socket.emit("connect-transport", { dtlsParameters });
//         callback();
//       });

//       transport.on("produce", ({ kind, rtpParameters }, callback) => {
//         socket.emit("produce", { kind, rtpParameters }, ({ id }) =>
//           callback({ id })
//         );
//       });

//       await transport.produce({ track: stream.getVideoTracks()[0] });
//       await transport.produce({ track: stream.getAudioTracks()[0] });
//     });
//   };

//   /* CONSUME */
//   const consumeStream = (producerId) => {
//     const socket = socketRef.current;
//     const device = deviceRef.current;

//     socket.emit("create-transport", {}, async (params) => {
//       const recvTransport = device.createRecvTransport(params);

//       recvTransport.on("connect", ({ dtlsParameters }, callback) => {
//         socket.emit("connect-transport", { dtlsParameters });
//         callback();
//       });

//       socket.emit(
//         "consume",
//         {
//           producerId,
//           rtpCapabilities: device.rtpCapabilities,
//         },
//         async ({ id, kind, rtpParameters }) => {
//           const consumer = await recvTransport.consume({
//             id,
//             producerId,
//             kind,
//             rtpParameters,
//           });

//           consumersRef.current[producerId] = consumer;

//           const stream = new MediaStream();
//           stream.addTrack(consumer.track);

//           setRemoteStreams((prev) => {
//             if (prev.find((s) => s.id === stream.id)) return prev;
//             return [...prev, stream];
//           });
//         }
//       );
//     });
//   };

//   /* 🎥 SCREEN SHARE */
//   const startScreenShare = async () => {
//     const screen = await navigator.mediaDevices.getDisplayMedia({
//       video: true,
//     });

//     const screenTrack = screen.getVideoTracks()[0];

//     localVideo.current.srcObject = new MediaStream([screenTrack]);

//     const sender = sendTransportRef.current
//       ?.getSenders()
//       ?.find((s) => s.track.kind === "video");

//     if (sender) sender.replaceTrack(screenTrack);

//     screenTrack.onended = stopScreenShare;
//   };

//   const stopScreenShare = () => {
//     const originalStream = localStreamRef.current;

//     localVideo.current.srcObject = originalStream;

//     const videoTrack = originalStream.getVideoTracks()[0];

//     const sender = sendTransportRef.current
//       ?.getSenders()
//       ?.find((s) => s.track.kind === "video");

//     if (sender) sender.replaceTrack(videoTrack);
//   };

//   /* 🔇 MUTE */
//   const toggleMute = () => {
//     const track = localStreamRef.current.getAudioTracks()[0];
//     track.enabled = !track.enabled;
//     setIsMuted(!track.enabled);
//   };

//   /* 📷 CAMERA */
//   const toggleCamera = () => {
//     const track = localStreamRef.current.getVideoTracks()[0];
//     track.enabled = !track.enabled;
//     setIsCameraOff(!track.enabled);
//   };

//   /* CHAT */
//   const sendMessage = () => {
//     if (!input.trim()) return;

//     const msg = { message: input, user: "You" };
//     setMessages((prev) => [...prev, msg]);

//     socketRef.current.emit("send-message", {
//       roomId: id,
//       message: input,
//       user: "User",
//     });

//     setInput("");
//   };

//   return (
//     <div className="h-screen bg-[#202124] flex">

//       {/* VIDEO */}
//       <div className="flex-1 flex flex-col">

//         <div className="flex justify-between px-6 py-3 text-white">
//           <h2>Room: {id}</h2>
//           <button onClick={() => setShowChat(!showChat)}>💬</button>
//         </div>

//         <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
//           <video ref={localVideo} autoPlay muted className="rounded-xl" />

//           {remoteStreams.map((stream, i) => (
//             <video
//               key={i}
//               autoPlay
//               ref={(v) => v && (v.srcObject = stream)}
//               className="rounded-xl"
//             />
//           ))}
//         </div>

//         {/* CONTROLS */}
//         <div className="flex justify-center gap-6 py-4">
//           <button onClick={toggleMute}>
//             {isMuted ? "🔇" : "🎤"}
//           </button>

//           <button onClick={toggleCamera}>
//             {isCameraOff ? "🚫📷" : "📷"}
//           </button>

//           <button onClick={startScreenShare}>🖥️</button>

//           <button onClick={() => navigate("/")}>📞</button>
//         </div>
//       </div>

//       {/* CHAT + PARTICIPANTS */}
//       {showChat && (
//         <div className="w-80 bg-[#2a2b2e] text-white flex flex-col">

//           <div className="p-3 border-b">Chat</div>

//           <div className="flex-1 overflow-y-auto p-3">
//             {messages.map((m, i) => (
//               <div key={i}>{m.message}</div>
//             ))}
//           </div>

//           <div className="p-2 flex">
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               className="flex-1"
//             />
//             <button onClick={sendMessage}>Send</button>
//           </div>

//           <div className="p-3 border-t">
//             <h3>Participants ({participants.length})</h3>
//             {participants.map((p, i) => (
//               <div key={i}>User {p.slice(0, 5)}</div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import { Device } from "mediasoup-client";
// import { useParams, useNavigate } from "react-router-dom";

// export default function MeetingScreen() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const socketRef = useRef(null);
//   const deviceRef = useRef(null);
//   const sendTransportRef = useRef(null);

//   const localVideo = useRef(null);
//   const [remoteStreams, setRemoteStreams] = useState([]);

//   useEffect(() => {
//     const start = async () => {
//       const socket = io("http://localhost:5000", {
//         withCredentials: true,
//       });

//       socketRef.current = socket;

//       /* ================= LOCAL STREAM ================= */
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       localVideo.current.srcObject = stream;

//       /* ================= DEVICE ================= */
//       const device = new Device();
//       deviceRef.current = device;

//       // ⚠️ TEMP (next step me fix karenge)
//       await device.load({
//         routerRtpCapabilities: { codecs: [] },
//       });

//       socket.emit("join-room", { roomId: id });

//       /* ================= CREATE SEND TRANSPORT ================= */
//       socket.emit("create-transport", {}, async (params) => {
//         const sendTransport = device.createSendTransport(params);
//         sendTransportRef.current = sendTransport;

//         sendTransport.on("connect", ({ dtlsParameters }, callback) => {
//           socket.emit("connect-transport", { dtlsParameters });
//           callback();
//         });

//         sendTransport.on("produce", ({ kind, rtpParameters }, callback) => {
//           socket.emit(
//             "produce",
//             { kind, rtpParameters },
//             ({ id }) => callback({ id })
//           );
//         });

//         /* SEND TRACKS */
//         const videoTrack = stream.getVideoTracks()[0];
//         await sendTransport.produce({ track: videoTrack });

//         const audioTrack = stream.getAudioTracks()[0];
//         await sendTransport.produce({ track: audioTrack });
//       });

//       /* ================= RECEIVE ================= */
//       socket.on("new-producer", async ({ socketId }) => {
//         socket.emit("create-transport", {}, async (params) => {
//           const recvTransport = device.createRecvTransport(params);

//           recvTransport.on("connect", ({ dtlsParameters }, callback) => {
//             socket.emit("connect-transport", { dtlsParameters });
//             callback();
//           });

//           socket.emit(
//             "consume",
//             {
//               producerId: socketId,
//               rtpCapabilities: device.rtpCapabilities,
//             },
//             async ({ id, kind, rtpParameters }) => {
//               const consumer = await recvTransport.consume({
//                 id,
//                 producerId: socketId,
//                 kind,
//                 rtpParameters,
//               });

//               const remoteStream = new MediaStream();
//               remoteStream.addTrack(consumer.track);

//               setRemoteStreams((prev) => [...prev, remoteStream]);
//             }
//           );
//         });
//       });
//     };

//     start();
//   }, [id]);

//   return (
//     <div className="h-screen bg-[#202124] flex flex-col">

//       {/* TOP BAR */}
//       <div className="flex justify-between px-6 py-3 text-white">
//         <h2>Room: {id}</h2>
//         <button
//           className="bg-red-500 px-4 py-1 rounded"
//           onClick={() => navigate("/")}
//         >
//           Leave
//         </button>
//       </div>

//       {/* VIDEO GRID */}
//       <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 p-4">

//         {/* LOCAL */}
//         <video
//           ref={localVideo}
//           autoPlay
//           muted
//           className="w-full rounded-xl"
//         />

//         {/* REMOTE USERS */}
//         {remoteStreams.map((stream, index) => (
//           <video
//             key={index}
//             autoPlay
//             ref={(video) => {
//               if (video) video.srcObject = stream;
//             }}
//             className="w-full rounded-xl"
//           />
//         ))}
//       </div>
//     </div>
//   );
// }







// // import { useEffect } from "react";
// // import { io } from "socket.io-client";
// // import { useParams } from "react-router-dom";

// // export default function MeetingScreen() {
// //   const { id } = useParams();

// //   useEffect(() => {
// //     const socket = io("http://localhost:5000", {
// //       query: { userId: Math.random().toString(36).slice(2) },
// //     });

// //     socket.on("connect", () => {
// //       console.log("Connected:", socket.id);

// //       socket.emit("join-room", {
// //         roomId: id,
// //         userId: socket.id,
// //       });
// //     });

// //     socket.on("all-users", (users) => {
// //       console.log("All users:", users);
// //     });

// //     socket.on("user-joined", (data) => {
// //       console.log("User joined:", data);
// //     });

// //   }, [id]);

// //   return <div>Meeting Room</div>;
// // }

// import { useState } from "react";
// import { FaMicrophone, FaVideo } from "react-icons/fa";
// import { MdCallEnd } from "react-icons/md";
// import { HiUserGroup } from "react-icons/hi";
// import { IoChatbubbleEllipses } from "react-icons/io5";

// export default function MeetingScreen() {
//   const [showPopup, setShowPopup] = useState(true);

  
//   return (
//     <div className="h-screen bg-black relative text-white">

//       {/* VIDEO AREA */}
//       <div className="w-full h-full flex items-center justify-center">
//         <div className="w-[80%] h-[80%] bg-gray-900 rounded-xl flex items-center justify-center">
//           <p>Your Camera</p>
//         </div>
//       </div>

//       {/* POPUP (LINK SHARE) */}
//       {showPopup && (
//         <div className="absolute top-20 left-10 bg-white text-black p-5 rounded-xl shadow-xl w-80">

//           <div className="flex justify-between items-center mb-3">
//             <h2 className="font-semibold">Your meeting's ready</h2>
//             <button onClick={() => setShowPopup(false)}>✕</button>
//           </div>

//           <button className="btn btn-primary w-full mb-3">
//             Add others
//           </button>

//           <p className="text-sm mb-2">
//             Share this link with others
//           </p>

//           <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
//             <span className="text-sm">meet/app/abc123</span>
//             <button className="text-blue-600">📋</button>
//           </div>

//         </div>
//       )}

//       {/* BOTTOM BAR */}
//       <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-800 px-6 py-3 rounded-full">

//         <button className="btn btn-circle bg-gray-700 border-none">
//           <FaMicrophone />
//         </button>

//         <button className="btn btn-circle bg-gray-700 border-none">
//           <FaVideo />
//         </button>

//         <button className="btn btn-circle bg-red-600 border-none">
//           <MdCallEnd />
//         </button>

//         <button className="btn btn-circle bg-gray-700 border-none">
//           <HiUserGroup />
//         </button>

//         <button className="btn btn-circle bg-gray-700 border-none">
//           <IoChatbubbleEllipses />
//         </button>

//       </div>

//     </div>
//   );
// }

// import { useEffect, useRef } from "react";
// import { io } from "socket.io-client";
// import { useNavigate, useParams } from "react-router-dom";
// import { axiosInstance } from "../lib/axios";

// export default function MeetingScreen() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const localVideo = useRef(null);
//   const remoteVideo = useRef(null);
//   const socketRef = useRef(null);
//   const localStreamRef = useRef(null);

//   const peerConnection = useRef(null);
//   const socketBaseUrl = axiosInstance.defaults.baseURL.replace(/\/api$/, "");

//   useEffect(() => {
//     const start = async () => {
//       try {
//         const localStream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         });
//         localStreamRef.current = localStream;

//         if (localVideo.current) {
//           localVideo.current.srcObject = localStream;
//         }

//         const socket = io(socketBaseUrl, {
//           withCredentials: true,
//           transports: ["websocket", "polling"],
//         });
//         socketRef.current = socket;

//         socket.on("connect", () => {
//           socket.emit("join-room", { roomId: id });
//         });

//         socket.on("all-users", (users) => {
//           const otherUsers = users.filter((userSocketId) => userSocketId !== socket.id);
//           if (otherUsers.length > 0) {
//             createOffer(localStream, otherUsers[0]);
//           }
//         });

//         socket.on("user-joined", ({ socketId }) => {
//           if (socketId && socketId !== socket.id) {
//             createOffer(localStream, socketId);
//           }
//         });

//         socket.on("webrtc-offer", async ({ from, offer }) => {
//           await createAnswer(localStream, from, offer);
//         });

//         socket.on("webrtc-answer", async ({ answer }) => {
//           if (peerConnection.current) {
//             await peerConnection.current.setRemoteDescription(answer);
//           }
//         });

//         socket.on("webrtc-ice", async ({ candidate }) => {
//           if (peerConnection.current && candidate) {
//             await peerConnection.current.addIceCandidate(candidate);
//           }
//         });
//       } catch (error) {
//         console.error("Failed to start meeting:", error);
//       }
//     };

//     start();

//     return () => {
//       if (peerConnection.current) {
//         peerConnection.current.close();
//         peerConnection.current = null;
//       }

//       if (localStreamRef.current) {
//         localStreamRef.current.getTracks().forEach((track) => track.stop());
//         localStreamRef.current = null;
//       }

//       if (socketRef.current) {
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [id, socketBaseUrl]);

//   /* ================= CREATE OFFER ================= */
//   const createPeer = (targetId, localStream) => {
//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     localStream.getTracks().forEach((track) =>
//       pc.addTrack(track, localStream)
//     );

//     pc.ontrack = (event) => {
//       remoteVideo.current.srcObject = event.streams[0];
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socketRef.current?.emit("webrtc-ice", {
//           to: targetId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     peerConnection.current = pc;
//     return pc;
//   };

//   const createOffer = async (localStream, targetId) => {
//     const pc = createPeer(targetId, localStream);

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     socketRef.current?.emit("webrtc-offer", {
//       to: targetId,
//       offer,
//     });
//   };

//   /* ================= CREATE ANSWER ================= */
//   const createAnswer = async (localStream, from, offer) => {
//     const pc = createPeer(from, localStream);

//     await pc.setRemoteDescription(offer);

//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);

//     socketRef.current?.emit("webrtc-answer", {
//       to: from,
//       answer,
//     });
//   };

//   return (
//     <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
//       <div className="w-full max-w-5xl flex items-center justify-between px-4">
//         <h2 className="text-white">Room: {id}</h2>
//         <button className="btn btn-error btn-sm" onClick={() => navigate("/")}>
//           Leave
//         </button>
//       </div>

//       <div className="flex gap-4">
//         <video ref={localVideo} autoPlay muted className="w-64 rounded-xl" />
//         <video ref={remoteVideo} autoPlay className="w-64 rounded-xl" />
//       </div>
//     </div>
//   );
// }