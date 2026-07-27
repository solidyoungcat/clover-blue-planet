import { useEffect, useRef, useCallback, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useRoomStore } from "../stores/roomStore";
import { useChatStore, type Message } from "../stores/chatStore";
import { ClientEvents, ServerEvents, API_VERSION } from "../types/messages";

const SERVER_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SERVER_URL) ||
  "http://localhost:3001";

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

export function useSocket(roomCode: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needPassword, setNeedPassword] = useState(false);
  const setPartnerOnline = useRoomStore((s) => s.setPartnerOnline);
  const addMessage = useChatStore((s) => s.addMessage);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: false,
      query: { v: String(API_VERSION) },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("connected");
      setErrorMessage(null);
    });

    socket.io.on("reconnect_attempt", () => {
      setConnectionStatus("reconnecting");
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        setConnectionStatus("disconnected");
      } else {
        setConnectionStatus("reconnecting");
      }
    });

    socket.on(ServerEvents.PARTNER_JOINED, () => setPartnerOnline(true));
    socket.on(ServerEvents.PARTNER_LEFT, () => setPartnerOnline(false));

    socket.on(ServerEvents.ROOM_NEED_PASSWORD, () => setNeedPassword(true));

    socket.on(ServerEvents.CHAT_MESSAGE, (msg: Message) => {
      if (msg && typeof msg.id === "string" && msg.sender === "partner") {
        addMessage(msg);
      }
    });

    // 接收消息历史
    socket.on("chat:history", (history: Array<{
      id: number; room_code: string; sender: string;
      text: string; type: string; timestamp: number;
    }>) => {
      if (Array.isArray(history)) {
        history.forEach((h) => {
          addMessage({
            id: String(h.id),
            sender: h.sender === "me" ? "me" : "partner",
            text: h.text,
            type: (h.type as "text" | "emoji" | "voice") || "text",
            timestamp: h.timestamp,
          });
        });
      }
    });

    socket.on(ServerEvents.ERROR, (err: { message: string }) => {
      setErrorMessage(err?.message || "未知错误");
      setTimeout(() => setErrorMessage(null), 5000);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [roomCode]);

  const createRoom = useCallback(
    (code: string, password?: string) => {
      socketRef.current?.emit(ClientEvents.ROOM_CREATE, { code, password });
    },
    []
  );

  const joinRoom = useCallback((code: string, password?: string) => {
    setNeedPassword(false);
    socketRef.current?.emit(ClientEvents.ROOM_JOIN, { code, password });
  }, []);

  const checkRoom = useCallback(
    (code: string, callback: (result: { exists: boolean; hasPassword: boolean; userCount: number }) => void) => {
      const handler = (result: any) => {
        callback(result);
        socketRef.current?.off(ServerEvents.ROOM_CHECK_RESULT, handler);
      };
      socketRef.current?.on(ServerEvents.ROOM_CHECK_RESULT, handler);
      socketRef.current?.emit(ClientEvents.ROOM_CHECK, code);
    },
    []
  );

  const sendChatMessage = useCallback(
    (message: Message) => {
      socketRef.current?.emit(ClientEvents.CHAT_MESSAGE, { roomCode, message });
    },
    [roomCode]
  );

  const sendSyncState = useCallback(
    (state: unknown) => {
      socketRef.current?.emit(ClientEvents.SYNC_STATE, { roomCode, state });
    },
    [roomCode]
  );

  const sendPetUpdate = useCallback(
    (petState: unknown) => {
      socketRef.current?.emit(ClientEvents.PET_UPDATE, { roomCode, petState });
    },
    [roomCode]
  );

  return {
    connectionStatus,
    isConnected: connectionStatus === "connected",
    errorMessage,
    needPassword,
    createRoom,
    joinRoom,
    checkRoom,
    sendChatMessage,
    sendSyncState,
    sendPetUpdate,
  };
}
