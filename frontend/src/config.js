export const WS_URL =
  process.env.NODE_ENV === "production"
    ? "wss://figgie.app/ws"
    : "ws://localhost:8080/ws";
