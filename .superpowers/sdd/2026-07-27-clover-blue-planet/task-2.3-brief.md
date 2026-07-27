# Task 2.3: 视频同步 — useVideoSync hook + sync module

**Files:**
- Create: `packages/shared/src/lib/sync.ts`
- Create: `packages/shared/src/hooks/useVideoSync.ts`
- Modify: `packages/shared/src/components/player/VideoPlayer.tsx` (wire sync)
- Modify: `packages/web/src/App.tsx` (wire remote state handler from socket)

**Interfaces:**
- Consumes: Tasks 1.3 (playerStore), 1.5 (useSocket), 2.2 (VideoPlayer)
- Produces:
  - `useVideoSync(roomCode)` — returns `{ handleRemoteState }` to plug into socket listener
  - `createSyncPayload(isPlaying, currentTime, playbackRate)` → SyncState
  - `shouldApplyRemoteState(local, remote, threshold)` → boolean

**Setup:** In `App.tsx`, connect the `sync:state` socket event to `useVideoSync`'s `handleRemoteState`.

---

### Step 1: `packages/shared/src/lib/sync.ts`

```typescript
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
```

### Step 2: `packages/shared/src/hooks/useVideoSync.ts`

```typescript
import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "../stores/playerStore";
import { useSocket } from "./useSocket";
import type { SyncState } from "../lib/sync";

export function useVideoSync(roomCode: string) {
  const player = usePlayerStore();
  const { sendSyncState } = useSocket(roomCode);
  const lastSentRef = useRef(0);
  const isRemoteUpdate = useRef(false);

  // Send local state changes (throttled ~100ms)
  useEffect(() => {
    const now = Date.now();
    if (now - lastSentRef.current < 100 || isRemoteUpdate.current) return;
    lastSentRef.current = now;

    sendSyncState({
      isPlaying: player.isPlaying,
      currentTime: player.currentTime,
      playbackRate: player.playbackRate,
    });
  }, [player.isPlaying, player.currentTime, player.playbackRate]);

  // Apply remote state
  const handleRemoteState = useCallback(
    (state: SyncState) => {
      isRemoteUpdate.current = true;
      player.setSyncStatus("connected");

      if (state.isPlaying) player.play();
      else player.pause();

      if (Math.abs(player.currentTime - state.currentTime) > 0.5) {
        player.seek(state.currentTime);
      }

      setTimeout(() => { isRemoteUpdate.current = false; }, 100);
    },
    [player]
  );

  return { handleRemoteState };
}
```

### Step 3: 更新 `packages/shared/src/components/player/VideoPlayer.tsx`

Add at the top of component:
```typescript
import { useVideoSync } from "../../hooks/useVideoSync";
```

Inside VideoPlayer, add:
```typescript
useVideoSync(roomCode);
```

And add `roomCode` to props:
```typescript
interface VideoPlayerProps {
  onFullscreen?: () => void;
  roomCode: string;
}
```

### Step 4: 更新 `packages/web/src/App.tsx`

Need to pass `roomCode` to VideoPlayer and wire the socket's `sync:state` event to `handleRemoteState`. The simplest approach: use a ref-based listener.

In App.tsx, add effect:
```typescript
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Inside App():
const syncHandlerRef = useRef<((s: any) => void) | null>(null);

useEffect(() => {
  const socket = io("http://localhost:3001");
  socket.on("sync:state", (state: any) => {
    syncHandlerRef.current?.(state);
  });
  return () => { socket.disconnect(); };
}, []);
```

And in VideoPlayer, call `useVideoSync(roomCode)` which internally calls `useSocket` — but we need to bridge. Better: pass `handleRemoteState` from App down to VideoPlayer. Add to VideoPlayerProps:

```typescript
interface VideoPlayerProps {
  onFullscreen?: () => void;
  roomCode: string;
}
```

And use `useVideoSync(roomCode)` inside VideoPlayer itself. The `useSocket` hook inside `useVideoSync` will connect to the server directly.

### Step 5: 确认 shared/index.ts 导出

```typescript
export { useVideoSync } from "./hooks/useVideoSync";
export { createSyncPayload, shouldApplyRemoteState } from "./lib/sync";
```

### Step 6: Commit `git add -A && git commit -m "feat: add video sync state relay via Socket.IO"`
