export const WS_URL =
  process.env.NODE_ENV === "production"
    ? "wss://figgie.xyz/ws"
    : "ws://localhost:8080/ws";
