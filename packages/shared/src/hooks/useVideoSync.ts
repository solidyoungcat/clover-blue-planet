import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { usePlayerStore } from "../stores/playerStore";
import type { SyncState } from "../lib/sync";
import { shouldApplyRemoteState } from "../lib/sync";

const SERVER_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SERVER_URL) ||
  "http://localhost:3001";

export function useVideoSync(roomCode: string) {
  const player = usePlayerStore();
  const socketRef = useRef<Socket | null>(null);
  const lastSentRef = useRef(0);
  const isRemoteUpdate = useRef(false);

  // Connect socket and listen for remote sync state
  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("room:join", roomCode);
    });

    socket.on("sync:state", (state: SyncState) => {
      isRemoteUpdate.current = true;

      player.setSyncStatus("connected");

      if (state.isPlaying) player.play();
      else player.pause();

      if (shouldApplyRemoteState(
        { currentTime: player.currentTime },
        state
      )) {
        player.seek(state.currentTime);
      }

      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 100);
    });

    socket.connect();

    return () => {
      socket.emit("room:leave", roomCode);
      socket.disconnect();
    };
  }, [roomCode]);

  // Send local state changes (throttled ~100ms, skip during remote updates)
  useEffect(() => {
    const now = Date.now();
    if (now - lastSentRef.current < 100 || isRemoteUpdate.current) return;
    lastSentRef.current = now;

    socketRef.current?.emit("sync:state", {
      roomCode,
      state: {
        isPlaying: player.isPlaying,
        currentTime: player.currentTime,
        playbackRate: player.playbackRate,
        timestamp: Date.now(),
      },
    });
  }, [player.isPlaying, player.currentTime, player.playbackRate]);

  // Expose handleRemoteState for external wiring if needed
  const handleRemoteState = useCallback(
    (state: SyncState) => {
      isRemoteUpdate.current = true;

      player.setSyncStatus("connected");

      if (state.isPlaying) player.play();
      else player.pause();

      if (shouldApplyRemoteState(
        { currentTime: player.currentTime },
        state
      )) {
        player.seek(state.currentTime);
      }

      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 100);
    },
    [player]
  );

  return { handleRemoteState };
}
