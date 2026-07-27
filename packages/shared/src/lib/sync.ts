export type SyncState = {
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  timestamp: number;
};

export function createSyncPayload(
  isPlaying: boolean,
  currentTime: number,
  playbackRate: number
): SyncState {
  return { isPlaying, currentTime, playbackRate, timestamp: Date.now() };
}

export function shouldApplyRemoteState(
  local: { currentTime: number },
  remote: SyncState,
  threshold = 0.5
): boolean {
  return Math.abs(local.currentTime - remote.currentTime) > threshold;
}
