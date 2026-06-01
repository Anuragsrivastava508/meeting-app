
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
export default function LobbyScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const initials =
    authUser?.fullName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const toggleCam = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setCamOn(track.enabled);
  };

  const joinMeeting = () => {
    navigate(`/room/${id}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/room/${id}`
    );
  };

  return (
    <div className="min-h-screen bg-[#202124] text-white">

      {/* Navbar */}
      <div className="h-16 flex items-center justify-between px-8">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2d2e30] flex items-center justify-center">
            🎥
          </div>

          <h1 className="text-2xl font-medium">
            QuickMeet
          </h1>
        </div>

        <div className="flex items-center gap-4">

          <p className="text-lg">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <div className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center">
            {initials}
          </div>

        </div>

      </div>

      {/* Main Layout */}
      <div className="max-w-[1500px] mx-auto px-10 py-8 grid lg:grid-cols-[1fr_350px] gap-20 items-center">

        {/* Left */}
        <div className="flex flex-col items-center">

          <div className="relative w-full max-w-[900px] aspect-video bg-[#3c4043] rounded-[30px] overflow-hidden shadow-2xl">

            {camOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">

                <div className="w-28 h-28 rounded-full bg-purple-600 flex items-center justify-center text-4xl">
                  {initials}
                </div>

                <h2 className="mt-6 text-3xl">
                  Camera is off
                </h2>

              </div>
            )}

            {/* Name */}
            <div className="absolute top-5 left-5 text-lg font-medium">
              {authUser?.fullName || "You"}
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">

              <button
                onClick={toggleMic}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition ${
                  micOn
                    ? "bg-gray-600"
                    : "bg-red-600"
                }`}
              >
                🎤
              </button>

              <button
                onClick={toggleCam}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition ${
                  camOn
                    ? "bg-gray-600"
                    : "bg-red-600"
                }`}
              >
                📹
              </button>

              <button className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center text-xl">
                ⋮
              </button>

            </div>

          </div>

          {/* Devices */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">

            <button className="px-5 py-3 rounded-full border border-gray-500">
              🎤 Microphone
            </button>

            <button className="px-5 py-3 rounded-full border border-gray-500">
              🔊 Speakers
            </button>

            <button className="px-5 py-3 rounded-full border border-gray-500">
              📹 Camera
            </button>

          </div>

        </div>

        {/* Right */}
        <div className="flex flex-col items-center">

          <h1 className="text-5xl font-normal">
            Ready to join?
          </h1>

          <p className="text-gray-400 mt-5">
            No one else is here
          </p>

          <button
            onClick={joinMeeting}
            className="w-full mt-8 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-lg font-medium transition"
          >
            Join now
          </button>

          <button
            className="w-full mt-4 h-12 rounded-full border border-gray-500 text-blue-400"
          >
            Other ways to join
          </button>

          <div className="w-full h-px bg-gray-700 my-8"></div>

          <p className="text-gray-400 text-sm">
            Or share this meeting link
          </p>

          <div className="w-full mt-4 bg-[#303134] rounded-xl p-4 flex items-center gap-3">

            <span className="flex-1 truncate">
              {window.location.origin}/room/{id}
            </span>

            <button
              onClick={copyLink}
              className="text-blue-400 font-medium"
            >
              Copy
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}