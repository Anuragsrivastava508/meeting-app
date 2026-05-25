import { io } from "socket.io-client";

const socketBaseUrl = "http://localhost:5001";

export const socket = io(socketBaseUrl, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  autoConnect: false,
});