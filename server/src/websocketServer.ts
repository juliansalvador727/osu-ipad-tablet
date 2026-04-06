import { WebSocketServer, WebSocket } from "ws";
import { decode } from "./protocol.js";
import { handleMessage } from "./inputHandler.js";

export function startServer(port: number): WebSocketServer {
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws: WebSocket, req) => {
    const addr = req.socket.remoteAddress ?? "unknown";
    console.log(`Client connected: ${addr}`);

    ws.on("message", (data: Buffer) => {
      const msg = decode(Buffer.from(data));
      if (msg) {
        handleMessage(msg);
      }
    });

    ws.on("close", () => {
      console.log(`Client disconnected: ${addr}`);
    });

    ws.on("error", (err) => {
      console.error(`WebSocket error (${addr}):`, err.message);
    });
  });

  wss.on("error", (err) => {
    console.error("Server error:", err.message);
  });

  return wss;
}
