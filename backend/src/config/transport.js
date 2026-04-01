import { getRouter } from "./mediasoup.js";

export const createWebRtcTransport = async () => {
  const router = getRouter();

  const transport = await router.createWebRtcTransport({
    listenIps: [
      {
        ip: "0.0.0.0",
        announcedIp: "127.0.0.1", // 🔴 change in production
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  });

  console.log("🚀 Transport created:", transport.id);

  return transport;
};