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

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:5000");

export default function MeetingScreen() {
  const { id } = useParams();

  const localVideo = useRef();
  const remoteVideo = useRef();

  const peerConnection = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    start();
  }, []);

  const start = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideo.current.srcObject = localStream;
    setStream(localStream);

    socket.on("connect", () => {
      socket.emit("join-room", { roomId: id });
    });

    socket.on("all-users", (users) => {
      if (users.length > 1) {
        createOffer(localStream, users[0]);
      }
    });

    socket.on("user-joined", ({ socketId }) => {
      createOffer(localStream, socketId);
    });

    socket.on("webrtc-offer", async ({ from, offer }) => {
      await createAnswer(localStream, from, offer);
    });

    socket.on("webrtc-answer", async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(answer);
    });

    socket.on("webrtc-ice", async ({ candidate }) => {
      await peerConnection.current.addIceCandidate(candidate);
    });
  };

  /* ================= CREATE OFFER ================= */
  const createPeer = (targetId, localStream) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.getTracks().forEach((track) =>
      pc.addTrack(track, localStream)
    );

    pc.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice", {
          to: targetId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  const createOffer = async (localStream, targetId) => {
    const pc = createPeer(targetId, localStream);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("webrtc-offer", {
      to: targetId,
      offer,
    });
  };

  /* ================= CREATE ANSWER ================= */
  const createAnswer = async (localStream, from, offer) => {
    const pc = createPeer(from, localStream);

    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("webrtc-answer", {
      to: from,
      answer,
    });
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <h2 className="text-white">Room: {id}</h2>

      <div className="flex gap-4">
        <video ref={localVideo} autoPlay muted className="w-64 rounded-xl" />
        <video ref={remoteVideo} autoPlay className="w-64 rounded-xl" />
      </div>
    </div>
  );
}