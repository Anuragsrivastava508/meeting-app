import mediasoup from "mediasoup";

let worker;
let router;

/* ================= CREATE WORKER ================= */
export const createMediasoupWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 2000,
    rtcMaxPort: 2020,
  });

  console.log("🔥 Mediasoup Worker created");

  worker.on("died", () => {
    console.error("❌ Mediasoup worker died");
    process.exit(1);
  });

  return worker;
};

/* ================= CREATE ROUTER ================= */
export const createRouter = async () => {
  router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
      },
    ],
  });

  console.log("🚀 Mediasoup Router ready");

  return router;
};

export const getRouter = () => router;