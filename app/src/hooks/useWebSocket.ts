import { useState, useRef, useCallback } from "react";
import { buildWebSocketUrl, formatServerTarget } from "../lib/serverEndpoint";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

const CONNECT_TIMEOUT_MS = 5000;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [target, setTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalClose = useRef(false);

  const clearReconnect = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const clearConnectTimeout = () => {
    if (connectTimeout.current) {
      clearTimeout(connectTimeout.current);
      connectTimeout.current = null;
    }
  };

  const connect = useCallback((ip: string, port: number) => {
    const url = buildWebSocketUrl(ip, port);
    const targetLabel = formatServerTarget(ip, port);

    intentionalClose.current = false;
    clearReconnect();
    clearConnectTimeout();
    if (wsRef.current) {
      intentionalClose.current = true;
      wsRef.current.close();
    }

    setTarget(targetLabel);
    setError(null);
    setStatus("connecting");

    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    let backoff = 1000;
    let opened = false;

    connectTimeout.current = setTimeout(() => {
      if (!opened && wsRef.current === ws) {
        setStatus("error");
        setError(`Connection timed out after ${CONNECT_TIMEOUT_MS / 1000}s`);
        ws.close();
      }
    }, CONNECT_TIMEOUT_MS);

    ws.onopen = () => {
      opened = true;
      clearConnectTimeout();
      setStatus("connected");
      setError(null);
      backoff = 1000;
    };

    ws.onclose = () => {
      clearConnectTimeout();
      wsRef.current = null;

      if (!intentionalClose.current) {
        setStatus((prev) => (prev === "error" ? "error" : "disconnected"));
        reconnectTimer.current = setTimeout(() => {
          connect(ip, port);
        }, backoff);
        backoff = Math.min(backoff * 2, 8000);
      } else {
        setStatus("disconnected");
      }
    };

    ws.onerror = () => {
      setStatus("error");
      setError(`Could not connect to ${targetLabel}`);
    };
  }, []);

  const disconnect = useCallback(() => {
    intentionalClose.current = true;
    clearReconnect();
    clearConnectTimeout();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setTarget(null);
    setError(null);
    setStatus("disconnected");
  }, []);

  return { wsRef, status, target, error, connect, disconnect };
}
