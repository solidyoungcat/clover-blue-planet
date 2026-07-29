import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "../stores/playerStore";
import type { SyncState } from "../lib/sync";
import { shouldApplyRemoteState } from "../lib/sync";

/**
 * 视频同步 Hook（v2 — 使用共享 Socket.IO 连接）
 */
export function useVideoSync(
  roomCode: string,
  sendSyncState: (state: SyncState) => void,
  onSyncState: (handler: (state: SyncState) => void) => () => void,
) {
  const player = usePlayerStore();
  const lastSentRef = useRef(0);
  const isRemoteUpdate = useRef(false);

  // 注册远程同步事件监听
  useEffect(() => {
    const cleanup = onSyncState((state: SyncState) => {
      isRemoteUpdate.current = true;

      player.setSyncStatus("connected");

      if (state.isPlaying) player.play();
      else player.pause();

      if (shouldApplyRemoteState(
        { currentTime: player.currentTime },
        state,
      )) {
        player.seek(state.currentTime);
      }

      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 100);
    });

    return cleanup;
  }, [roomCode, onSyncState]); // eslint-disable-line react-hooks/exhaustive-deps

  // 发送本地状态变更（节流 200ms，跳过远程更新期间）
  useEffect(() => {
    const now = Date.now();
    if (now - lastSentRef.current < 200 || isRemoteUpdate.current) return;
    lastSentRef.current = now;

    sendSyncState({
      isPlaying: player.isPlaying,
      currentTime: player.currentTime,
      playbackRate: player.playbackRate,
      timestamp: Date.now(),
    });
  }, [player.isPlaying, player.currentTime, player.playbackRate]);

  const handleRemoteState = useCallback(
    (state: SyncState) => {
      isRemoteUpdate.current = true;

      player.setSyncStatus("connected");

      if (state.isPlaying) player.play();
      else player.pause();

      if (shouldApplyRemoteState(
        { currentTime: player.currentTime },
        state,
      )) {
        player.seek(state.currentTime);
      }

      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 100);
    },
    [player],
  );

  return { handleRemoteState };
}
