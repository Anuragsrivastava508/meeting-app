import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "../lib/socket";
import { Device } from "mediasoup-client";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import ProfilePages from "./ProfilePages";
import toast from "react-hot-toast";

export default function MeetingScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  const deviceRef = useRef(null);
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);   // ✅ single shared recv transport
  const localVideo = useRef(null);
  const localStreamRef = useRef(null);
  const consumersRef = useRef({});
  const pendingProducersRef = useRef([]);
  const participantsRef = useRef([]);
  const socketRef = useRef(socket);

  const [remotePeers, setRemotePeers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [activePanel, setActivePanel] = useState("chat");
  const [panelOpen, setPanelOpen] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [mediaError, setMediaError] = useState(null);

  const chatBodyRef = useRef(null);
  const setupDoneRef = useRef(false);
  const leaveTimerRef = useRef(null);
  const inRoomRef = useRef(false);
  const ensureJoinedRef = useRef(() => Promise.resolve());

  participantsRef.current = participants;

  /* Timer */
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${ss}`;
  };

  /* Chat auto scroll */
  useEffect(() => {
    if (chatBodyRef.current)
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages]);

  /* ── MAIN SETUP ── */
  useEffect(() => {
    let mounted = true;

    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    if (!socket.connected) socket.connect();
    socketRef.current = socket;

    const refreshParticipants = () => {
      socket.emit("get-participants", id, (users) => {
        if (Array.isArray(users)) setParticipants(users);
      });
    };

    const resetTransports = () => {
      setupDoneRef.current = false;
      Object.values(consumersRef.current).forEach((c) => c.close());
      consumersRef.current = {};
      pendingProducersRef.current = [];
      recvTransportRef.current?.close();
      recvTransportRef.current = null;
      sendTransportRef.current?.close();
      sendTransportRef.current = null;
      deviceRef.current = null;
    };

    const queueOrConsume = ({ producerId, socketId, fullName }) => {
      if (!producerId || !socketId || socketId === socket.id) return;
      if (consumersRef.current[producerId]) return;

      if (!deviceRef.current) {
        pendingProducersRef.current.push({ producerId, socketId, fullName });
        return;
      }
      consumeStream(producerId, socketId, fullName);
    };

    const flushPendingProducers = () => {
      const pending = [...pendingProducersRef.current];
      pendingProducersRef.current = [];
      pending.forEach(queueOrConsume);
    };

    const handleRoomParticipants = (users) => {
      if (Array.isArray(users)) {
        setParticipants(users);
        inRoomRef.current = users.some((u) => u.socketId === socket.id);
      }
    };

    const handleUserJoined = () => refreshParticipants();
    const handleUserLeft = ({ socketId }) => {
      refreshParticipants();
      setRemotePeers((prev) => prev.filter((p) => p.socketId !== socketId));
    };
    const handleNewProducer = ({ producerId, socketId, fullName }) => {
      queueOrConsume({ producerId, socketId, fullName });
    };
    const handleReceiveMessage = (msg) => {
      if (!msg?.message) return;
      setMessages((prev) => [
        ...prev,
        { message: msg.message, user: msg.user || "User", isMe: false },
      ]);
    };

    const handleSocketDisconnect = () => {
      resetTransports();
      setRemotePeers([]);
    };

    socket.on("room-participants", handleRoomParticipants);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("new-producer", handleNewProducer);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("disconnect", handleSocketDisconnect);

    const ensureJoined = () =>
      new Promise((resolve) => {
        if (!socket.connected) {
          socket.once("connect", () => ensureJoined().then(resolve));
          return;
        }

        socket.emit("join-room", { roomId: id }, (res) => {
          if (res?.ok) {
            inRoomRef.current = true;
            if (Array.isArray(res.participants)) setParticipants(res.participants);
          }
          resolve(res);
        });
      });

    ensureJoinedRef.current = ensureJoined;

    const setupMediasoup = async (stream) => {
      if (setupDoneRef.current && deviceRef.current) {
        flushPendingProducers();
        return;
      }

      socket.emit("get-rtp-capabilities", async (caps) => {
        try {
          if (!caps || !mounted) return;
          if (!deviceRef.current) {
            const device = new Device();
            await device.load({ routerRtpCapabilities: caps });
            deviceRef.current = device;
          }
          setupDoneRef.current = true;

          if (stream && !sendTransportRef.current) {
            await createSendTransport(stream, deviceRef.current);
          }
          flushPendingProducers();
        } catch (err) {
          console.error("❌ Mediasoup setup error:", err);
        }
      });
    };

    const acquireMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMediaError(null);
        return stream;
      } catch (err) {
        console.warn("Camera/mic blocked:", err.message);
        setMediaError(err.message);

        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          toast("Camera blocked — joined with microphone only");
          setMediaError(null);
          return audioOnly;
        } catch {
          toast.error("Allow camera & microphone to share video");
          return null;
        }
      }
    };

    const init = async () => {
      try {
        let stream = localStreamRef.current;
        if (!stream) {
          stream = await acquireMedia();
          if (!mounted) return;
          if (stream) {
            localStreamRef.current = stream;
            if (localVideo.current) localVideo.current.srcObject = stream;
          }
        }

        await setupMediasoup(stream);
      } catch (err) {
        console.error("❌ Init error:", err);
      }
    };

    const start = async () => {
      await ensureJoined();
      if (mounted) init();
    };

    socket.on("connect", start);
    start();

    return () => {
      mounted = false;
      socket.off("room-participants", handleRoomParticipants);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("new-producer", handleNewProducer);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("disconnect", handleSocketDisconnect);
      socket.off("connect", start);

      leaveTimerRef.current = setTimeout(() => {
        inRoomRef.current = false;
        socket.emit("leave-room");
        resetTransports();
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        setRemotePeers([]);
      }, 400);
    };
  }, [id]);

  /* ── SEND TRANSPORT ── */
  const createSendTransport = (stream, device) =>
    new Promise((resolve, reject) => {
      socket.emit("create-transport", { direction: "send" }, async (params) => {
        try {
          if (!params?.id) return reject(new Error("No send transport params"));

          const transport = device.createSendTransport(params);
          sendTransportRef.current = transport;

          transport.on("connect", ({ dtlsParameters }, cb) => {
            socket.emit("connect-transport", { dtlsParameters, direction: "send" });
            cb();
          });

          transport.on("produce", ({ kind, rtpParameters }, cb) => {
            socket.emit("produce", { kind, rtpParameters }, ({ id }) => cb({ id }));
          });

          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];
          if (videoTrack) await transport.produce({ track: videoTrack });
          if (audioTrack) await transport.produce({ track: audioTrack });
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });

  /* ── RECV TRANSPORT (shared single instance) ── */
  const getOrCreateRecvTransport = (device) => {
    return new Promise((resolve) => {
      if (recvTransportRef.current) return resolve(recvTransportRef.current);

      socket.emit("create-transport", { direction: "recv" }, async (params) => {
        const transport = device.createRecvTransport(params);

        transport.on("connect", ({ dtlsParameters }, cb) => {
          socket.emit("connect-transport", {
            dtlsParameters,
            direction: "recv",
            transportId: params.id,
          });
          cb();
        });

        recvTransportRef.current = transport;
        resolve(transport);
      });
    });
  };

  /* ── CONSUME ── */
 const consumeStream = async (producerId, peerSocketId, peerNameHint) => {
  const device = deviceRef.current;

  if (!device) {
    console.log("❌ Device not ready");
    return;
  }

  if (consumersRef.current[producerId]) {
    console.log("⚠️ Already consuming:", producerId);
    return;
  }

  try {
    const recvTransport = await getOrCreateRecvTransport(device);

    socket.emit(
      "consume",
      {
        producerId,
        rtpCapabilities: device.rtpCapabilities,
      },
      async (data) => {
        try {
          if (!data?.id) {
            console.log("❌ Invalid consume response");
            return;
          }

          const {
            id: consumerId,
            kind,
            rtpParameters,
          } = data;

          const consumer = await recvTransport.consume({
            id: consumerId,
            producerId,
            kind,
            rtpParameters,
          });

          consumersRef.current[producerId] = consumer;

          // ✅ IMPORTANT FIX
          if (consumer.resume) {
            await consumer.resume();
          }

          const track = consumer.track;

          const peerName =
            peerNameHint ||
            participantsRef.current.find(
              (p) => p.socketId === peerSocketId
            )?.fullName ||
            `Guest ${peerSocketId.slice(0, 5)}`;

          setRemotePeers((prev) => {
            const existing = prev.find(
              (p) => p.socketId === peerSocketId
            );

            // ✅ Existing peer stream
            if (existing) {
              const hasTrack =
                kind === "video"
                  ? existing.stream.getVideoTracks().length > 0
                  : existing.stream.getAudioTracks().length > 0;

              if (hasTrack) return prev;

              const newStream = new MediaStream(
                existing.stream.getTracks()
              );

              newStream.addTrack(track);

              return prev.map((p) =>
                p.socketId === peerSocketId
                  ? {
                      ...p,
                      stream: newStream,
                    }
                  : p
              );
            }

            // ✅ New peer stream
            const newPeer = {
              socketId: peerSocketId,
              name: peerName,
              stream: new MediaStream([track]),
            };

            return [...prev, newPeer];
          });

          console.log(
            `✅ ${kind} stream received from ${peerName}`
          );
        } catch (err) {
          console.error("❌ Consume stream error:", err);
        }
      }
    );
  } catch (err) {
    console.error("❌ consumeStream failed:", err);
  }
};

  /* SCREEN SHARE */
  const startScreenShare = async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = screen.getVideoTracks()[0];
    if (localVideo.current) localVideo.current.srcObject = new MediaStream([screenTrack]);
    setIsSharing(true);
    screenTrack.onended = stopScreenShare;
  };

  const stopScreenShare = () => {
    if (localVideo.current) localVideo.current.srcObject = localStreamRef.current;
    setIsSharing(false);
  };

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsCameraOff(!track.enabled);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    if (!socket.connected) {
      toast.error("Not connected to server");
      return;
    }

    if (!inRoomRef.current) {
      await ensureJoinedRef.current();
    }

    setMessages((prev) => [
      ...prev,
      { message: text, user: authUser?.fullName || "You", isMe: true },
    ]);
    socket.emit("send-message", { message: text, roomId: id });
    setInput("");
  };

  const enableMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const previousStream = localStreamRef.current;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = stream;
      if (localVideo.current) localVideo.current.srcObject = stream;
      setMediaError(null);

      if (deviceRef.current) {
        if (!sendTransportRef.current) {
          await createSendTransport(stream, deviceRef.current);
        } else {
          const hasVideoTrack = previousStream?.getVideoTracks().length > 0;
          const newVideoTrack = stream.getVideoTracks()[0];
          if (!hasVideoTrack && newVideoTrack) {
            await sendTransportRef.current.produce({ track: newVideoTrack });
          }
        }
      }

      toast.success("Camera & microphone enabled");
    } catch (err) {
      toast.error("Permission denied — allow access in browser settings");
      setMediaError(err.message);
    }
  }, []);

  const otherParticipants = participants.filter(
    (p) => p.socketId && p.socketId !== socket.id
  );

  const togglePanel = (panel) => {
    if (activePanel === panel && panelOpen) setPanelOpen(false);
    else { setActivePanel(panel); setPanelOpen(true); }
  };

  const avatarColors = ["#534AB7","#1D9E75","#D85A30","#B7A020","#207DB7"];
  const getColor = (str) => avatarColors[(str?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div style={S.root}>

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.logo}>M</div>
        <div style={S.divider} />
        <SIcon icon="🏠" title="Home" onClick={() => navigate("/")} />
        <SIcon icon="⊞" title="Grid" />
        <SIcon icon="✏️" title="Whiteboard" />
        <div style={{ flex: 1 }} />
        <SIcon icon="⚙️" title="Settings" />
        <SIcon icon="?" title="Help" />
      </div>

      {/* MAIN */}
      <div style={S.main}>

        {/* TOPBAR */}
        <div style={S.topbar}>
          <div style={S.topLeft}>
            <span style={S.roomBadge}>📹 meet/{id}</span>
            <span style={S.recDot} />
            <span style={S.recLabel}>REC</span>
          </div>
          <div style={S.topRight}>
            <button style={S.bellBtn}>🔔</button>
            <div style={S.profileChip} onClick={() => togglePanel("profile")}>
              {authUser?.profilePic
                ? <img src={authUser.profilePic} alt="" style={S.avatar} />
                : <div style={{ ...S.avatar, background: "#534AB7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                    {authUser?.fullName?.slice(0, 2).toUpperCase()}
                  </div>
              }
              <span style={S.profileName}>{authUser?.fullName?.split(" ")[0]}</span>
              <span style={{ color: "#888", fontSize: 11 }}>▾</span>
            </div>
          </div>
        </div>

        {/* VIDEO GRID */}
        <div style={{
          ...S.grid,
          gridTemplateColumns: remotePeers.length === 0 ? "1fr"
            : remotePeers.length <= 1 ? "1fr 1fr"
            : remotePeers.length <= 3 ? "1fr 1fr"
            : "1fr 1fr 1fr",
        }}>
          {/* Local */}
          <div style={{ ...S.tile, border: "1.5px solid #534AB7" }}>
            <video ref={localVideo} autoPlay muted playsInline style={S.video} />
            {mediaError && (
              <div style={S.mediaBlock}>
                <p style={{ fontSize: 12, marginBottom: 8 }}>Camera/mic blocked</p>
                <button type="button" className="btn btn-primary btn-sm" onClick={enableMedia}>
                  Allow camera & mic
                </button>
              </div>
            )}
            <span style={S.tileName}>{authUser?.fullName ?? "You"}</span>
            <span style={S.youTag}>You</span>
            {isMuted && <span style={S.mutedBadge}>🔇</span>}
          </div>

          {/* Remote */}
          {remotePeers.map((peer) => (
            <div key={peer.socketId} style={S.tile}>
              <video
                autoPlay
                ref={(v) => {
                  if (v) v.srcObject = peer.stream;
                }}
                style={S.video}
              />
              <span style={S.tileName}>{peer.name}</span>
            </div>
          ))}

          {/* Empty */}
          {remotePeers.length === 0 && (
            <div style={S.emptyTile}>
              <div style={{ fontSize: 36, opacity: 0.2 }}>👤</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 8 }}>Waiting for others...</div>
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div style={S.controls}>
          <span style={S.timer}>{formatTime(elapsed)}</span>

          <div style={S.ctrlGroup}>
            <CBtn icon={isMuted ? "🔇" : "🎤"} label={isMuted ? "Unmute" : "Mute"} danger={isMuted} onClick={toggleMute} />
            <CBtn icon={isCameraOff ? "🚫" : "📷"} label={isCameraOff ? "Start Cam" : "Stop Cam"} danger={isCameraOff} onClick={toggleCamera} />
            <CBtn icon={isSharing ? "⏹️" : "🖥️"} label={isSharing ? "Stop Share" : "Share"} active={isSharing} onClick={isSharing ? stopScreenShare : startScreenShare} />
            <CBtn icon="✋" label={handRaised ? "Lower" : "Raise"} active={handRaised} onClick={() => setHandRaised((h) => !h)} />
            <CBtn icon="😊" label="React" onClick={() => {}} />
            <CBtn icon="···" label="More" onClick={() => {}} />
            <button
              style={S.leaveBtn}
              onClick={() => {
                if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
                socket.emit("leave-room");
                navigate("/");
              }}
            >
              📞 Leave
            </button>
          </div>

          <div style={S.panelBtns}>
            <PBtn icon="💬" label="Chat" active={panelOpen && activePanel === "chat"}
              badge={messages.filter(m => !m.isMe).length || null} onClick={() => togglePanel("chat")} />
            <PBtn icon="👥" label="People" active={panelOpen && activePanel === "people"}
              badge={participants.length > 0 ? participants.length : null} onClick={() => togglePanel("people")} />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      {panelOpen && (
        <div style={S.panel}>
          {/* Tabs */}
          <div style={S.tabs}>
            {["chat", "people", "profile"].map((t) => (
              <button key={t} style={{ ...S.tab, ...(activePanel === t ? S.tabActive : {}) }}
                onClick={() => setActivePanel(t)}>
                {t === "chat" ? "💬 Chat" : t === "people" ? "👥 People" : "👤 Profile"}
                {t === "people" && <span style={S.tabBadge}>{participants.length}</span>}
              </button>
            ))}
          </div>

          {/* CHAT */}
          {activePanel === "chat" && (
            <>
              <div ref={chatBodyRef} style={S.chatBody}>
                {messages.length === 0 && <div style={S.empty}>No messages yet. Say hi! 👋</div>}
                {messages.map((m, i) => (
                  <div key={i} style={{ ...S.msgWrap, alignItems: m.isMe ? "flex-end" : "flex-start" }}>
                    <span style={S.msgUser}>{m.isMe ? "You" : m.user}</span>
                    <div style={{ ...S.bubble, ...(m.isMe ? S.bubbleMe : {}) }}>{m.message}</div>
                  </div>
                ))}
              </div>
              <div style={S.chatInput}>
                <input style={S.input} value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a message..." />
                <button style={S.sendBtn} onClick={sendMessage}>➤</button>
              </div>
            </>
          )}

          {/* PEOPLE */}
          {activePanel === "people" && (
            <div style={S.peopleList}>
              <div style={S.peopleHeader}>In this call · {participants.length}</div>
              {/* Self */}
              <div style={S.personRow}>
                {authUser?.profilePic
                  ? <img src={authUser.profilePic} alt="" style={S.pAvatar} />
                  : <div style={{ ...S.pAvatar, background: "#534AB7", color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {authUser?.fullName?.slice(0, 2).toUpperCase()}
                    </div>
                }
                <span style={S.pName}>{authUser?.fullName} <span style={{ fontSize: 10, color: "#666" }}>(You)</span></span>
                <span>{isMuted ? "🔇" : "🎤"}</span>
              </div>
              {otherParticipants.map((p) => (
                <div key={p.socketId} style={S.personRow}>
                  {p.profilePic ? (
                    <img src={p.profilePic} alt="" style={S.pAvatar} />
                  ) : (
                    <div style={{ ...S.pAvatar, background: getColor(p.fullName), color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {p.fullName?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                  )}
                  <span style={S.pName}>{p.fullName}</span>
                  <span>🎤</span>
                </div>
              ))}
              {otherParticipants.length === 0 && (
                <div style={S.empty}>No others in the call yet.</div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {activePanel === "profile" && (
            <div style={{ flex: 1, overflowY: "auto" }}><ProfilePages /></div>
          )}
        </div>
      )}
    </div>
  );
}

/* SUB-COMPONENTS */
function SIcon({ icon, title, onClick }) {
  return (
    <button title={title} onClick={onClick} style={{ width: 40, height: 40, borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
      {icon}
    </button>
  );
}

function CBtn({ icon, label, onClick, danger, active }) {
  return (
    <button onClick={onClick} title={label} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      background: danger ? "rgba(226,75,74,0.15)" : active ? "rgba(83,74,183,0.18)" : "rgba(255,255,255,0.07)",
      border: `0.5px solid ${danger ? "rgba(226,75,74,0.4)" : active ? "#534AB7" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 10, padding: "7px 12px", cursor: "pointer",
      color: danger ? "#e24b4a" : active ? "#AFA9EC" : "#d0d0d0", minWidth: 50,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 10, color: "#aaa", whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
}

function PBtn({ icon, label, active, badge, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      background: active ? "rgba(83,74,183,0.2)" : "rgba(255,255,255,0.07)",
      border: `0.5px solid ${active ? "#534AB7" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 10, padding: "7px 12px", cursor: "pointer",
      color: active ? "#AFA9EC" : "#d0d0d0", minWidth: 50, position: "relative",
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 10, color: "#aaa" }}>{label}</span>
      {badge && <span style={{ position: "absolute", top: -4, right: -4, background: "#E24B4A", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 10, padding: "1px 4px" }}>{badge}</span>}
    </button>
  );
}

/* STYLES */
const S = {
  root: 
  { 
    display: "flex",
    height: "100vh",
    background: "#202124",
    fontFamily: "'Segoe UI',system-ui,sans-serif",
    overflow: "hidden" 
      },
  sidebar:
   { 
    width: 60,
    background: "#2a2b2e", 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center",
    padding: "12px 0", 
    gap: 6, 
    borderRight: "0.5px solid rgba(255,255,255,0.08)",
    flexShrink: 0 
      },
  logo:
   {
     width: 36,
      height: 36,
       borderRadius: 8,
        background: "#534AB7",
         color: "#fff",
          display: "flex",
           alignItems: "center",
            justifyContent: "center",
             fontWeight: 700,
              fontSize: 18,
               marginBottom: 8 
              },
  divider:
   { 
    width: 32,
     height: 0.5,
      background: "rgba(255,255,255,0.1)",
       margin: "4px 0" 
      },
  main:
   { flex: 1, 
    display: "flex", 
    flexDirection: "column",
     minWidth: 0 },
  topbar: 
  { display: "flex",
     alignItems: "center",
      justifyContent: "space-between",
       padding: "10px 18px", 
       background: "#202124",
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
         flexShrink: 0 },
  topLeft:
   { display: "flex", 
    alignItems: "center",
     gap: 12 },
  topRight:
   { display: "flex", 
    alignItems: "center",
     gap: 10 },
  roomBadge:
   { background: "rgba(255,255,255,0.07)", 
    color: "#d0d0d0", 
    fontSize: 12,
     padding: "4px 10px",
      borderRadius: 20,
       border: "0.5px solid rgba(255,255,255,0.12)"
       },
  recDot:
   { width: 8,
     height: 8,
      borderRadius: "50%", 
      background: "#E24B4A", 
      display: "inline-block" 
    },
  recLabel:
   { 
   fontSize: 11,
    color: "#E24B4A",
     fontWeight: 600,
      letterSpacing: 1
     },
  bellBtn:
   { width: 34, 
    height: 34,
     borderRadius: "50%",
      background: "rgba(255,255,255,0.07)", 
      border: "0.5px solid rgba(255,255,255,0.1)", 
      cursor: "pointer", 
      fontSize: 15 
    },
  profileChip:
   { display: "flex",
     alignItems: "center",
      gap: 8, 
      background: "rgba(255,255,255,0.05)",
       border: "0.5px solid rgba(255,255,255,0.12)",
        borderRadius: 20,
         padding: "4px 10px 4px 4px",
          cursor: "pointer" 
        },
  avatar:
   { width: 28,
     height: 28,
      borderRadius: "50%",
       objectFit: "cover" 
      },
  profileName: 
  { fontSize: 13,
     color: "#d0d0d0" 
    },
  grid:
   {
     flex: 1,
     display: "grid",
      gap: 8,
       padding: 10,
        overflow: "hidden" 
      },
  tile:
   { 
    background: "#2d2e31",
     borderRadius: 14,
      position: "relative",
       overflow: "hidden", 
       display: "flex",
        alignItems: "center",
         justifyContent: "center",
          border: "0.5px solid rgba(255,255,255,0.07)" 
        },
  video:
   { width: "100%",
     height: "100%", 
     objectFit: "cover", 
     borderRadius: 14 
    },
  tileName: 
  {
     position: "absolute",
      bottom: 10,
       left: 12,
        fontSize: 12,
         color: "#e0e0e0",
         background: "rgba(0,0,0,0.55)",
          padding: "2px 8px",
           borderRadius: 10
           },
  youTag:
   { 
    position: "absolute", 
    bottom: 10, 
    right: 12, 
    fontSize: 10, 
    color: "#AFA9EC", 
    background: "rgba(83,74,183,0.3)", 
    padding: "2px 7px", 
    borderRadius: 10, 
    border: "0.5px solid #534AB7" 
  },
  mutedBadge:
   {
     position: "absolute", 
     top: 10, 
     right: 10, 
     background: "rgba(226,75,74,0.9)", 
     borderRadius: "50%", 
     width: 24, 
     height: 24, 
     display: "flex", 
     alignItems: "center", 
     justifyContent: "center", 
     fontSize: 12 
    },
  emptyTile:
   {
     background: "#2a2b2e", 
     borderRadius: 14, 
     border: "1px dashed rgba(255,255,255,0.1)", 
     display: "flex", 
     flexDirection: "column", 
     alignItems: "center", 
     justifyContent: "center" 
    },
  mediaBlock:
   {
     position: "absolute", 
     inset: 0, 
     display: "flex", 
     flexDirection: "column", 
     alignItems: "center", 
     justifyContent: "center", 
     background: "rgba(0,0,0,0.75)", 
     padding: 16, 
     textAlign: "center", 
     color: "#e0e0e0" 
    },
  controls: 
  { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: "10px 16px", 
    background: "#202124", 
    borderTop: "0.5px solid rgba(255,255,255,0.07)", 
    flexShrink: 0, 
    gap: 8 
  },
  timer:
   {
     fontSize: 13, 
     color: "#888", 
     minWidth: 70, 
     fontVariantNumeric: "tabular-nums" 
    },
  ctrlGroup:
   {
     display: "flex", 
     alignItems: "center", 
     gap: 6, 
     flexWrap: "wrap", 
     justifyContent: "center" 
    },
  leaveBtn:
   {
     display: "flex",
      flexDirection: "column", 
      alignItems: "center", 
      gap: 3, 
      background: "rgba(226,75,74,0.15)", 
      border: "0.5px solid rgba(226,75,74,0.5)", 
      borderRadius: 10, 
      padding: "7px 14px", 
      cursor: "pointer", 
      color: "#e24b4a", 
      fontSize: 14, 
      fontWeight: 500, 
      minWidth: 60 
    },
  panelBtns:
   {
     display: "flex", 
     alignItems: "center", 
     gap: 6, 
     minWidth: 100, 
     justifyContent: "flex-end" 
    },
  panel:
   {
     width: 290, 
     background: "#2a2b2e", 
     display: "flex", 
     flexDirection: "column", 
     borderLeft: "0.5px solid rgba(255,255,255,0.08)", 
     flexShrink: 0 
    },
  tabs:
   {
     display: "flex", 
     borderBottom: "0.5px solid rgba(255,255,255,0.08)", 
     flexShrink: 0 
    },
  tab:
   {
     flex: 1, 
     padding: "11px 4px", 
     textAlign: "center", 
     fontSize: 12, 
     color: "#888", 
     cursor: "pointer", 
     background: "transparent", 
     border: "none", 
     borderBottom: "2px solid transparent" 
    },
  tabActive:
   {
     color: "#AFA9EC", 
     borderBottomColor: "#534AB7" 
    },
  tabBadge:
   {
     background: "rgba(255,255,255,0.1)",
     color: "#aaa", 
     fontSize: 10, 
     padding: "1px 5px", 
     borderRadius: 10, 
     marginLeft: 3 
    },
  chatBody:
   {
     flex: 1, 
     overflowY: "auto", 
     padding: 12, 
     display: "flex", 
     flexDirection: "column",
      gap: 10 
    },
  empty:
   {
     textAlign: "center", 
     color: "#555", 
     fontSize: 13, 
     marginTop: 24 
    },
  msgWrap:
   {
     display: "flex", 
     flexDirection: "column", 
     gap: 3 
    },
  msgUser:
   {
     fontSize: 11, 
     color: "#666",
      paddingLeft: 4 
    },
  bubble:
   { 
    background: "rgba(255,255,255,0.07)", 
    borderRadius: 10, 
    padding: "7px 10px", 
    fontSize: 13, 
    color: "#d0d0d0", 
    maxWidth: "90%", 
    wordBreak: "break-word" 
  },
  bubbleMe:
   {
     background: "rgba(83,74,183,0.25)", 
     border: "0.5px solid rgba(83,74,183,0.4)" 
    },
  chatInput:
   {
     display: "flex", 
     alignItems: "center", 
     gap: 6, 
     padding: "10px 10px 14px", 
     borderTop: "0.5px solid rgba(255,255,255,0.08)", 
     flexShrink: 0 
    },
  input:
   { 
    flex: 1,
    background: "rgba(255,255,255,0.06)",
     border: "0.5px solid rgba(255,255,255,0.12)",
     borderRadius: 20,
     padding: "7px 12px", 
    fontSize: 13,
     color: "#e0e0e0", 
    outline: "none" 
  },
  sendBtn:
   { 
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#534AB7",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontSize: 16, 
    flexShrink: 0 
      },
  peopleList:
   { 
    flex: 1,
    overflowY: "auto",
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 2 
        },
  peopleHeader:
   { 
    fontSize: 12,
    color: "#666",
    padding: "0 4px 10px",
    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
    marginBottom: 6 
      },
  personRow: 
  { 
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 4px",
    borderBottom: "0.5px solid rgba(255,255,255,0.05)" 
      },
  pAvatar:
   {
     width: 34,
     height: 34,
     borderRadius: "50%",
     objectFit: "cover", 
     flexShrink: 0 
      },
  pName:
   {
     flex: 1,
     fontSize: 13,
     color: "#d0d0d0",
     overflow: "hidden",
     textOverflow: "ellipsis",
     whiteSpace: "nowrap" 
       
    },
};
