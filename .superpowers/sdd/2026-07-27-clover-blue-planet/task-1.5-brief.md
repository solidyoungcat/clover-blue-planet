# Task 1.5: Web 端房间联结 — useSocket hook + RoomConnector

**Files:**
- Create: `packages/shared/src/hooks/useSocket.ts`
- Create: `packages/shared/src/components/room/RoomConnector.tsx`
- Modify: `packages/web/src/App.tsx`
- Modify: `packages/shared/src/index.ts` (追加 exports)

**Interfaces:**
- Consumes: Tasks 1.1-1.4 (stores, server running)
- Produces:
  - `useSocket(roomCode)` → `{ isConnected, sendChatMessage, sendSyncState, sendPetUpdate }`
  - `RoomConnector` → 显示房间码、复制、生成、在线状态

**Note:** Server URL defaults to `http://localhost:3001`, overridable via env `VITE_SERVER_URL`.

---

### Step 1: `packages/shared/src/hooks/useSocket.ts`

```typescript
import { useEffect, useRef, useCallback, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useRoomStore } from "../stores/roomStore";
import { useChatStore, type Message } from "../stores/chatStore";

const SERVER_URL = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SERVER_URL) || "http://localhost:3001";

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
```

### Step 2: `packages/shared/src/components/room/RoomConnector.tsx`

```typescript
import React from "react";
import { useRoomStore } from "../../stores/roomStore";

export function RoomConnector() {
  const { roomCode, partnerOnline, generateRoomCode } = useRoomStore();

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-ocean-900/60 text-sm">
      <span className="text-ocean-300 shrink-0">房间码:</span>
      <code className="text-ocean-100 font-mono text-lg tracking-wider">{roomCode}</code>
      <button
        onClick={copyRoomCode}
        className="text-ocean-400 hover:text-ocean-200 transition-colors"
      >
        📋复制
      </button>
      <button
        onClick={generateRoomCode}
        className="text-ocean-500 hover:text-ocean-300 transition-colors text-xs"
      >
        换一个
      </button>
      <div className="flex-1" />
      <span className={partnerOnline ? "text-green-400" : "text-ocean-500"}>
        ● {partnerOnline ? "TA 已加入" : "等待TA..."}
      </span>
    </div>
  );
}
```

### Step 3: 更新 `packages/web/src/App.tsx`

Replace with:

```typescript
import React from "react";
import { AppLayout, useRoomStore, RoomConnector, useSocket } from "@clover/shared";

export function App() {
  const { roomCode, partnerOnline } = useRoomStore();
  const { isConnected, sendChatMessage, sendSyncState } = useSocket(roomCode);

  return (
    <AppLayout
      roomCode={roomCode}
      partnerOnline={partnerOnline}
      playerArea={
        <div className="flex flex-col flex-1 min-h-0">
          <RoomConnector />
          <div className="flex-1 flex items-center justify-center text-ocean-400 text-lg">
            📺 等待开始观影...
          </div>
        </div>
      }
      chatArea={
        <div className="flex-1 flex items-center justify-center text-ocean-400 text-lg">
          💬 聊天区域
        </div>
      }
      onCopyRoomCode={() => navigator.clipboard.writeText(roomCode)}
      onOpenTheme={() => {}}
      onOpenSettings={() => {}}
    />
  );
}
```

### Step 4: 更新 `packages/shared/src/index.ts` 追加:

```typescript
export { useSocket } from "./hooks/useSocket";
export { RoomConnector } from "./components/room/RoomConnector";
```

### Step 5: 验证
```bash
# Terminal 1:
pnpm dev:server
# Terminal 2:
pnpm dev:web
```
打开两个 tab，复制相同房间码，确认在线状态变化。

### Step 6: Commit `git add -A && git commit -m "feat: add WebSocket connection hook, room connector UI"`
