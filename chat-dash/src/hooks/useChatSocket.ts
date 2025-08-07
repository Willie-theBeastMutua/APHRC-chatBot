import { useEffect, useRef } from "react";

interface UseChatSocketOptions {
  url?: string;
  onMessage?: (msg: any) => void;
  onTyping?: (user: string) => void;
}

export function useChatSocket({
  url = "ws://localhost:3001",
  onMessage,
  onTyping,
}: UseChatSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number>(0);
  const reconnectTimeout = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          reconnectRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type === "typing" && data?.data?.user) {
              onTyping?.(data.data.user);
            } else if (data?.type === "message" && data?.data) {
              onMessage?.(data.data);
            }
          } catch (e) {
            // ignore malformed
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          // Exponential backoff up to ~8s
          const delay = Math.min(8000, 500 * 2 ** reconnectRef.current);
          reconnectRef.current += 1;
          reconnectTimeout.current = window.setTimeout(connect, delay);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        // schedule reconnect
        const delay = Math.min(8000, 500 * 2 ** reconnectRef.current);
        reconnectRef.current += 1;
        reconnectTimeout.current = window.setTimeout(connect, delay);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout.current) window.clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [url, onMessage, onTyping]);

  const send = (payload: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  };

  return { send };
}
