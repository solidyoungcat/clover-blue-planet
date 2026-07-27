import { useEffect, useRef, useCallback, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useRoomStore } from "../stores/roomStore";
import { useChatStore, type Message } from "../stores/chatStore";

const SERVER_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SERVER_URL) ||
  "http://localhost:3001";

export function useSocket(roomCode: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const setPartnerOnline = useRoomStore((s) => s.setPartnerOnline);
  const addMessage = useChatStore((s) => s.addMessage);

  useEffect(() => {
    const socket = io(SERVER_URL, { autoConnect: false });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("room:join", roomCode);
    });

    socket.on("disconnect", () => setIsConnected(false));
    socket.on("room:partner-joined", () => setPartnerOnline(true));
    socket.on("room:partner-left", () => setPartnerOnline(false));
    socket.on("chat:message", (msg: Message) => addMessage(msg));

    socket.connect();

    return () => {
      socket.emit("room:leave", roomCode);
      socket.disconnect();
    };
  }, [roomCode]);

  const sendChatMessage = useCallback(
    (message: Message) => {
      socketRef.current?.emit("chat:message", { roomCode, message });
    },
    [roomCode]
  );

  const sendSyncState = useCallback(
    (state: unknown) => {
      socketRef.current?.emit("sync:state", { roomCode, state });
    },
    [roomCode]
  );

  const sendPetUpdate = useCallback(
    (petState: unknown) => {
      socketRef.current?.emit("pet:update", { roomCode, petState });
    },
    [roomCode]
  );

  return { isConnected, sendChatMessage, sendSyncState, sendPetUpdate };
}
