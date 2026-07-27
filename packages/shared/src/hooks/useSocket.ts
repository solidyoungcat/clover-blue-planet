import { useEffect, useRef, useCallback, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useRoomStore } from "../stores/roomStore";
import { useChatStore, type Message } from "../stores/chatStore";
import { ClientEvents, ServerEvents } from "../types/messages";

const SERVER_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SERVER_URL) ||
  "http://localhost:3001";

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

export function useSocket(roomCode: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const setPartnerOnline = useRoomStore((s) => s.setPartnerOnline);
  const addMessage = useChatStore((s) => s.addMessage);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("connected");
      setErrorMessage(null);
      socket.emit(ClientEvents.ROOM_JOIN, { code: roomCode });
    });

    socket.io.on("reconnect_attempt", () => {
      setConnectionStatus("reconnecting");
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        setConnectionStatus("disconnected");
        setErrorMessage("服务器已关闭连接");
      } else {
        setConnectionStatus("reconnecting");
      }
    });

    socket.on(ServerEvents.PARTNER_JOINED, () => setPartnerOnline(true));
    socket.on(ServerEvents.PARTNER_LEFT, () => setPartnerOnline(false));

    socket.on(ServerEvents.CHAT_MESSAGE, (msg: Message) => {
      if (msg && typeof msg.id === "string" && msg.sender === "partner") {
        addMessage(msg);
      }
    });

    socket.on("error", (err: { message: string }) => {
      setErrorMessage(err?.message || "未知错误");
      setTimeout(() => setErrorMessage(null), 5000);
    });

    socket.connect();

    return () => {
      socket.emit(ClientEvents.ROOM_LEAVE, { code: roomCode });
      socket.disconnect();
    };
  }, [roomCode]);

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
    sendChatMessage,
    sendSyncState,
    sendPetUpdate,
  };
}
