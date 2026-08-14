import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MoreVertical,
  Volume2,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* useMediaStream — owns getUserMedia lifecycle, permission errors,   */
/* and track enable/disable. Kept out of the component so it's        */
/* testable on its own and reusable in the actual meeting Room later. */
/* ------------------------------------------------------------------ */

function useMediaStream() {
  const streamRef = useRef(null);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [error, setError] = useState(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setError("This browser doesn't support camera or microphone access.");
      return;
    }

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setError(
          err?.name === "NotAllowedError"
            ? "Camera and microphone access was blocked. Allow access in your browser settings and reload."
            : "Couldn't access your camera or microphone."
        );
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const toggleMic = useCallback(() => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  }, []);

  const toggleCam = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamOn(track.enabled);
  }, []);

  return { streamRef, status, error, camOn, micOn, toggleMic, toggleCam };
}

/* ------------------------------------------------------------------ */
/* Live clock — isolated so the 1s tick doesn't re-render the whole    */
/* screen (video preview, controls, etc).                              */
/* ------------------------------------------------------------------ */

function LiveClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="text-lg tabular-nums" aria-live="off">
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Presentational subcomponents                                       */
/* ------------------------------------------------------------------ */

function ControlButton({ icon: Icon, activeIcon: ActiveIcon, on, onClick, onLabel, offLabel }) {
  const Displayed = on ? Icon : ActiveIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!on}
      aria-label={on ? onLabel : offLabel}
      title={on ? onLabel : offLabel}
      className={`size-14 rounded-full flex items-center justify-center transition
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                  ${on ? "bg-gray-600 hover:bg-gray-500" : "bg-red-600 hover:bg-red-500"}`}
    >
      <Displayed className="w-6 h-6" />
    </button>
  );
}

function DeviceButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-3 rounded-full border border-gray-500 flex items-center gap-2 text-sm
                 hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function LobbyScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const videoRef = useRef(null);

  const { streamRef, status, error, camOn, micOn, toggleMic, toggleCam } = useMediaStream();
  const [copied, setCopied] = useState(false);

  const initials = useMemo(() => {
    const name = authUser?.fullName;
    if (!name) return "U";
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [authUser?.fullName]);

  // Attach the stream to the <video> element once it's ready, and clear
  // it on unmount so the element doesn't hold a dangling reference.
  useEffect(() => {
    if (status === "ready" && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [status, streamRef]);

  const meetingLink = `${window.location.origin}/room/${id}`;

  const joinMeeting = () => {
    if (!id) {
      toast.error("Missing meeting ID");
      return;
    }
    navigate(`/room/${id}`);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link — copy it manually");
    }
  };

  const notImplemented = (deviceName) => () => toast(`${deviceName} selection is coming soon`);

  return (
    <div className="min-h-screen bg-[#202124] text-white">
      {/* Top bar */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2d2e30] flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-medium">QuickMeet</h1>
        </div>

        <div className="flex items-center gap-4">
          <LiveClock />
          <div
            className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center"
            aria-label={`Signed in as ${authUser?.fullName ?? "you"}`}
          >
            {initials}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-10 py-8 grid lg:grid-cols-[1fr_350px] gap-10 lg:gap-20 items-center">
        {/* Left: preview */}
        <div className="flex flex-col items-center w-full">
          <div className="relative w-full max-w-[900px] aspect-video bg-[#3c4043] rounded-[24px] sm:rounded-[30px] overflow-hidden shadow-2xl">
            {status === "loading" && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-300">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <p>Setting up your camera…</p>
              </div>
            )}

            {status === "error" && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-8 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-400" />
                <p className="text-gray-200">{error}</p>
              </div>
            )}

            {status === "ready" && camOn && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}

            {status === "ready" && !camOn && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-purple-600 flex items-center justify-center text-4xl">
                  {initials}
                </div>
                <h2 className="mt-6 text-2xl sm:text-3xl">Camera is off</h2>
              </div>
            )}

            {status === "ready" && (
              <>
                <div className="absolute top-5 left-5 text-lg font-medium">
                  {authUser?.fullName || "You"}
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                  <ControlButton
                    icon={Mic}
                    activeIcon={MicOff}
                    on={micOn}
                    onClick={toggleMic}
                    onLabel="Mute microphone"
                    offLabel="Unmute microphone"
                  />
                  <ControlButton
                    icon={Video}
                    activeIcon={VideoOff}
                    on={camOn}
                    onClick={toggleCam}
                    onLabel="Turn off camera"
                    offLabel="Turn on camera"
                  />
                  <button
                    type="button"
                    aria-label="More options"
                    className="size-14 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <MoreVertical className="w-6 h-6" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Devices — placeholders until device selection ships */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <DeviceButton icon={Mic} label="Microphone" onClick={notImplemented("Microphone")} />
            <DeviceButton icon={Volume2} label="Speakers" onClick={notImplemented("Speaker")} />
            <DeviceButton icon={Video} label="Camera" onClick={notImplemented("Camera")} />
          </div>
        </div>

        {/* Right: join panel */}
        <div className="flex flex-col items-center w-full">
          <h1 className="text-3xl sm:text-5xl font-normal text-center">Ready to join?</h1>
          <p className="text-gray-400 mt-5">No one else is here</p>

          <button
            type="button"
            onClick={joinMeeting}
            className="w-full mt-8 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-lg font-medium transition
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Join now
          </button>

          <button
            type="button"
            onClick={() => toast("More ways to join are coming soon")}
            className="w-full mt-4 h-12 rounded-full border border-gray-500 text-blue-400
                       hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition"
          >
            Other ways to join
          </button>

          <div className="w-full h-px bg-gray-700 my-8" />

          <p className="text-gray-400 text-sm">Or share this meeting link</p>

          <div className="w-full mt-4 bg-[#303134] rounded-xl p-4 flex items-center gap-3">
            <span className="flex-1 truncate text-sm">{meetingLink}</span>
            <button
              type="button"
              onClick={copyLink}
              className="text-blue-400 font-medium flex items-center gap-1.5 shrink-0
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// looby screen .jsx file
// import { useEffect, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useAuthStore } from "../store/useAuthStore";
// export default function LobbyScreen() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { authUser } = useAuthStore();

//   const videoRef = useRef(null);
//   const streamRef = useRef(null);

//   const [camOn, setCamOn] = useState(true);
//   const [micOn, setMicOn] = useState(true);

//   const initials =
//     authUser?.fullName
//       ?.split(" ")
//       .map((w) => w[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2) || "U";

//   useEffect(() => {
//     navigator.mediaDevices
//       .getUserMedia({
//         video: true,
//         audio: true,
//       })
//       .then((stream) => {
//         streamRef.current = stream;

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       });

//     return () => {
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//     };
//   }, []);

//   const toggleMic = () => {
//     const track = streamRef.current?.getAudioTracks()[0];
//     if (!track) return;

//     track.enabled = !track.enabled;
//     setMicOn(track.enabled);
//   };

//   const toggleCam = () => {
//     const track = streamRef.current?.getVideoTracks()[0];
//     if (!track) return;

//     track.enabled = !track.enabled;
//     setCamOn(track.enabled);
//   };

//   const joinMeeting = () => {
//     navigate(`/room/${id}`);
//   };

//   const copyLink = () => {
//     navigator.clipboard.writeText(
//       `${window.location.origin}/room/${id}`
//     );
//   };

//   return (
//     <div className="min-h-screen bg-[#202124] text-white">

//       {/* Navbar */}
//       <div className="h-16 flex items-center justify-between px-8">

//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-[#2d2e30] flex items-center justify-center">
//             🎥
//           </div>

//           <h1 className="text-2xl font-medium">
//             QuickMeet
//           </h1>
//         </div>

//         <div className="flex items-center gap-4">

//           <p className="text-lg">
//             {new Date().toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit",
//             })}
//           </p>

//           <div className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center">
//             {initials}
//           </div>

//         </div>

//       </div>

//       {/* Main Layout */}
//       <div className="max-w-[1500px] mx-auto px-10 py-8 grid lg:grid-cols-[1fr_350px] gap-20 items-center">

//         {/* Left */}
//         <div className="flex flex-col items-center">

//           <div className="relative w-full max-w-[900px] aspect-video bg-[#3c4043] rounded-[30px] overflow-hidden shadow-2xl">

//             {camOn ? (
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 muted
//                 playsInline
//                 className="w-full h-full object-cover scale-x-[-1]"
//               />
//             ) : (
//               <div className="w-full h-full flex flex-col items-center justify-center">

//                 <div className="w-28 h-28 rounded-full bg-purple-600 flex items-center justify-center text-4xl">
//                   {initials}
//                 </div>

//                 <h2 className="mt-6 text-3xl">
//                   Camera is off
//                 </h2>

//               </div>
//             )}

//             {/* Name */}
//             <div className="absolute top-5 left-5 text-lg font-medium">
//               {authUser?.fullName || "You"}
//             </div>

//             {/* Controls */}
//             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">

//               <button
//                 onClick={toggleMic}
//                 className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition ${
//                   micOn
//                     ? "bg-gray-600"
//                     : "bg-red-600"
//                 }`}
//               >
//                 🎤
//               </button>

//               <button
//                 onClick={toggleCam}
//                 className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition ${
//                   camOn
//                     ? "bg-gray-600"
//                     : "bg-red-600"
//                 }`}
//               >
//                 📹
//               </button>

//               <button className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center text-xl">
//                 ⋮
//               </button>

//             </div>

//           </div>

//           {/* Devices */}
//           <div className="flex flex-wrap justify-center gap-3 mt-6">

//             <button className="px-5 py-3 rounded-full border border-gray-500">
//               🎤 Microphone
//             </button>

//             <button className="px-5 py-3 rounded-full border border-gray-500">
//               🔊 Speakers
//             </button>

//             <button className="px-5 py-3 rounded-full border border-gray-500">
//               📹 Camera
//             </button>

//           </div>

//         </div>

//         {/* Right */}
//         <div className="flex flex-col items-center">

//           <h1 className="text-5xl font-normal">
//             Ready to join?
//           </h1>

//           <p className="text-gray-400 mt-5">
//             No one else is here
//           </p>

//           <button
//             onClick={joinMeeting}
//             className="w-full mt-8 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-lg font-medium transition"
//           >
//             Join now
//           </button>

//           <button
//             className="w-full mt-4 h-12 rounded-full border border-gray-500 text-blue-400"
//           >
//             Other ways to join
//           </button>

//           <div className="w-full h-px bg-gray-700 my-8"></div>

//           <p className="text-gray-400 text-sm">
//             Or share this meeting link
//           </p>

//           <div className="w-full mt-4 bg-[#303134] rounded-xl p-4 flex items-center gap-3">

//             <span className="flex-1 truncate">
//               {window.location.origin}/room/{id}
//             </span>

//             <button
//               onClick={copyLink}
//               className="text-blue-400 font-medium"
//             >
//               Copy
//             </button>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }


