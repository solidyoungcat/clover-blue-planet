# Task 3 Brief — 客户端：消除 useVideoSync 的第二路 Socket.IO 连接

## Global Constraints
- 保持现有组件接口（props 结构）向后兼容
- 构建须通过 `cd D:/clover-blue-planet && pnpm build:web`
- 不引入新的 Socket.IO 连接

## 背景

当前 `useVideoSync` 在内部创建了独立的第二个 Socket.IO 连接（`io(SERVER_URL)`），与 `useSocket` 的连接完全独立。这导致：
- 双连接浪费资源
- 同步事件绕过密码保护（join 不传密码）
- 绕过速率限制（走独立 socket id）

修复方案：useVideoSync 接收共享 socket 的回调函数，不再自建连接。

## 改动

### 文件 A: `packages/shared/src/hooks/useSocket.ts`

#### 改动 A1：暴露 socketRef（行 136-148 的 return 对象）

在 return 对象中添加 `socketRef`：
```typescript
  return {
    connectionStatus,
    isConnected: connectionStatus === "connected",
    errorMessage,
    needPassword,
    socketRef,           // 暴露 socket ref 供 useVideoSync 使用
    createRoom,
    joinRoom,
    checkRoom,
    sendChatMessage,
    sendSyncState,
    sendPetUpdate,
  };
```

#### 改动 A2：添加 onSyncState 回调注册函数

在 return 语句之前（约第 135 行，`const sendPetUpdate` 之后）添加：
```typescript
  const onSyncState = useCallback(
    (handler: (state: unknown) => void): (() => void) => {
      const wrappedHandler = (state: unknown) => {
        if (state && typeof state === "object") {
          handler(state);
        }
      };
      socketRef.current?.on(ServerEvents.SYNC_STATE, wrappedHandler);
      return () => {
        socketRef.current?.off(ServerEvents.SYNC_STATE, wrappedHandler);
      };
    },
    [],
  );
```

然后在 return 对象中添加 `onSyncState,`（与其它返回值对齐）。

### 文件 B: `packages/shared/src/hooks/useVideoSync.ts`（完整重写）

将原文件完整替换为：
```typescript
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
```

### 文件 C: `packages/shared/src/components/player/VideoPlayer.tsx`

#### 改动 C1：修改 import 和 interface

原第 3 行：
```typescript
import { useVideoSync } from "../../hooks/useVideoSync";
```
改为：
```typescript
import type { SyncState } from "../../lib/sync";
import { useVideoSync } from "../../hooks/useVideoSync";
```

原第 7-10 行 interface：
```typescript
interface VideoPlayerProps {
  onFullscreen?: () => void;
  roomCode: string;
}
```
改为：
```typescript
interface VideoPlayerProps {
  onFullscreen?: () => void;
  roomCode: string;
  sendSyncState: (state: SyncState) => void;
  onSyncState: (handler: (state: SyncState) => void) => () => void;
}
```

#### 改动 C2：修改 useVideoSync 调用

原第 17 行：
```typescript
  useVideoSync(roomCode);
```
改为：
```typescript
  useVideoSync(roomCode, sendSyncState, onSyncState);
```

### 文件 D: `packages/web/src/App.tsx`

#### 改动 D1：解构新增 sendSyncState 和 onSyncState

原第 9-12 行：
```typescript
  const {
    connectionStatus, errorMessage, sendChatMessage,
    createRoom, joinRoom, checkRoom,
  } = useSocket(roomCode);
```
改为：
```typescript
  const {
    connectionStatus, errorMessage, sendChatMessage,
    sendSyncState, onSyncState,
    createRoom, joinRoom, checkRoom,
  } = useSocket(roomCode);
```

#### 改动 D2：传递新 props 给 VideoPlayer

原第 27 行：
```typescript
          <VideoPlayer roomCode={roomCode} onFullscreen={() => setCinemaMode(true)} />
```
改为：
```typescript
          <VideoPlayer
            roomCode={roomCode}
            sendSyncState={sendSyncState}
            onSyncState={onSyncState}
            onFullscreen={() => setCinemaMode(true)}
          />
```

## 验证
```bash
cd D:/clover-blue-planet && pnpm build:web
```
