# Code Review 修复计划 — 致命 & 高优先级问题

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复代码审查中发现的 6 个致命/高优先级问题和 2 个中优先级问题，确保 MVP 核心功能可用。

**Architecture:** 修复分为 4 个独立模块组：服务端安全与功能修复、连接架构重构、存储优化、客户端功能修复。每组内任务有依赖关系，组间可并行执行。

**Tech Stack:** TypeScript, Node.js, Socket.IO 4.x, React 18, Zustand 4.x, pnpm monorepo

## Global Constraints

- 所有改动仅改现有文件，不创建新文件（修复计划本身除外）
- 保持现有 API 合约不变（事件名、payload 结构）
- 服务端不得引入任何原生 C++ 依赖
- 客户端保留现有组件接口（props 结构）
- 所有修改后需通过 `pnpm build:server` 和 `pnpm build:web` 构建验证

---

### Task 1: 服务端 — 创建者自动加入房间 + 消息 sender 服务端覆写

**Files:**
- Modify: `packages/server/src/socket.ts` (行 127-131, 193-208)

**Interfaces:**
- Consumes: 无前置依赖
- Produces: 修正 socketRoomMap 条目、修正消息 sender 字段

- [ ] **Step 1: 修复 room:create 处理 — 创建后自动 join 并注册 socketRoomMap**

在 `packages/server/src/socket.ts` 的 `room:create` 处理器中，`socket.emit("room:created", ...)` 之前加入房间注册逻辑。

找到第 127-131 行：
```typescript
      createRoom(d.code, password);

      socket.emit("room:created", { code: d.code, hasPassword: !!password });
      console.log(`[room:created] ${d.code} ${password ? "(加密)" : "(公开)"}`);
```

替换为：
```typescript
      createRoom(d.code, password);

      // 创建者自动加入房间
      socket.join(d.code);
      socketRoomMap.set(socket.id, d.code);

      socket.emit("room:created", { code: d.code, hasPassword: !!password });
      console.log(`[room:created] ${d.code} ${password ? "(加密)" : "(公开)"}`);
```

- [ ] **Step 2: 修复 chat:message — 服务端强制覆写 sender 为 "partner"**

消息从客户端 A 到达服务端后，转发给客户端 B 时，sender 应由服务端设定为 "partner"（对 B 而言 A 是 partner），而非信任客户端传入的值。

找到第 199-211 行：
```typescript
      // 持久化消息
      const msg = d.message as any;
      saveMessage({
        roomCode: d.roomCode as string,
        sender: msg.sender,
        text: msg.text,
        type: msg.type,
        voiceUrl: msg.voiceUrl,
        timestamp: msg.timestamp,
      });

      const partner = getPartnerId(d.roomCode, socket.id);
      if (partner) io.to(partner).emit("chat:message", d.message);
```

替换为：
```typescript
      // 持久化消息 — 发送方对接收方而言永远是 "partner"
      const msg = d.message as any;
      saveMessage({
        roomCode: d.roomCode as string,
        sender: msg.sender,        // 存储原始 sender 用于历史加载时还原视角
        text: msg.text,
        type: msg.type,
        voiceUrl: msg.voiceUrl,
        timestamp: msg.timestamp,
      });

      const partner = getPartnerId(d.roomCode, socket.id);
      if (partner) {
        // 转发时强制覆写 sender，防止客户端伪造身份
        io.to(partner).emit("chat:message", { ...msg, sender: "partner" });
      }
```

- [ ] **Step 3: 构建验证**

```bash
cd D:/clover-blue-planet && pnpm --filter server build
```

预期：TypeScript 编译成功，无错误。

- [ ] **Step 4: Commit**

```bash
cd D:/clover-blue-planet
git add packages/server/src/socket.ts
git commit -m "fix(server): auto-join room on create + enforce sender on relay"
```

---

### Task 2: 服务端 — 同步/宠物广播鉴权 + 房间人数上限

**Files:**
- Modify: `packages/server/src/socket.ts` (行 214-230)
- Modify: `packages/server/src/rooms.ts` (行 49-50)

**Interfaces:**
- Consumes: Task 1 的 socketRoomMap 修复
- Produces: 鉴权守卫、房间 2 人上限

- [ ] **Step 1: 添加发送者房间鉴权**

在 `sync:state` 和 `pet:update` 处理器开头，校验 `socketRoomMap.get(socket.id)` 与 `d.roomCode` 匹配。

找到第 214-221 行：
```typescript
    socket.on("sync:state", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      if (!checkRateLimit(socket.id, "sync")) return;
      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (!isValidSyncState(d.state)) return;
      socket.to(d.roomCode).emit("sync:state", d.state);
    });
```

在 `checkRateLimit` 之后添加鉴权行：
```typescript
    socket.on("sync:state", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      if (!checkRateLimit(socket.id, "sync")) return;
      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (socketRoomMap.get(socket.id) !== d.roomCode) return;  // ✅ 鉴权
      if (!isValidSyncState(d.state)) return;
      socket.to(d.roomCode).emit("sync:state", d.state);
    });
```

同样在第 223-230 行对 `pet:update` 添加相同鉴权行（第 5 行后）：
```typescript
    socket.on("pet:update", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      if (!checkRateLimit(socket.id, "pet")) return;
      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (socketRoomMap.get(socket.id) !== d.roomCode) return;  // ✅ 鉴权
      if (!isValidPetState(d.petState)) return;
      socket.to(d.roomCode).emit("pet:update", d.petState);
    });
```

- [ ] **Step 2: rooms.ts 添加 2 人上限**

在 `packages/server/src/rooms.ts` 的 `joinRoom` 函数中，`room.users.add(socketId)` 之前添加人数检查。

找到第 50 行：
```typescript
  room.users.add(socketId);
```

替换为：
```typescript
  // 房间最多 2 人（双人同步观影）
  if (room.users.size >= 2) {
    return { error: "房间已满（最多 2 人）" };
  }
  room.users.add(socketId);
```

- [ ] **Step 3: 构建验证**

```bash
cd D:/clover-blue-planet && pnpm --filter server build
```

- [ ] **Step 4: Commit**

```bash
cd D:/clover-blue-planet
git add packages/server/src/socket.ts packages/server/src/rooms.ts
git commit -m "fix(server): auth gate for sync/pet events + 2-user room limit"
```

---

### Task 3: 连接架构 — 消除 useVideoSync 的第二路 Socket.IO 连接

**Files:**
- Modify: `packages/shared/src/hooks/useSocket.ts` (行 13-14, 136-148)
- Modify: `packages/shared/src/hooks/useVideoSync.ts` (完整重写)
- Modify: `packages/shared/src/components/player/VideoPlayer.tsx` (行 3, 12, 17)
- Modify: `packages/web/src/App.tsx` (行 9-12, 27)

**Interfaces:**
- Consumes: Task 1 的 socketRoomMap（服务端已修复，客户端配对）
- Produces: useSocket 暴露 `socketRef` 和 `sendSyncState`，useVideoSync 接收 socket 参数

**关键设计决策**：不创建 Socket Context，采用 prop drilling 方式（应用只有两层组件树），保持最小改动面。

- [ ] **Step 1: useSocket 暴露 socketRef**

在 `packages/shared/src/hooks/useSocket.ts` 中，`socketRef` 已在 hook 内部声明（第 14 行），需要在 return 中暴露。

找到第 136-148 行的 return：
```typescript
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
```

替换为（添加 `socketRef`）：
```typescript
  return {
    connectionStatus,
    isConnected: connectionStatus === "connected",
    errorMessage,
    needPassword,
    socketRef,           // ✅ 暴露 socket ref 供 useVideoSync 使用
    createRoom,
    joinRoom,
    checkRoom,
    sendChatMessage,
    sendSyncState,
    sendPetUpdate,
  };
```

- [ ] **Step 2: useVideoSync 重写 — 接收共享 socket 而非自建连接**

完整重写 `packages/shared/src/hooks/useVideoSync.ts`。

原文件（96 行）替换为以下内容：

```typescript
import { useEffect, useRef, useCallback } from "react";
import { usePlayerStore } from "../stores/playerStore";
import type { SyncState } from "../lib/sync";
import { shouldApplyRemoteState } from "../lib/sync";

/**
 * 视频同步 Hook（v2 — 使用共享 Socket.IO 连接）
 *
 * 不再创建独立的 Socket.IO 连接，而是接收父级传入的 sendSyncState 函数
 * 和 socket 实例用于监听远程同步事件。
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

  // 暴露手动处理远程状态的函数（供外部需要时使用）
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

- [ ] **Step 3: 在 useSocket 中添加 sync:state 监听器注册能力**

在 `packages/shared/src/hooks/useSocket.ts` 的 return 对象中，新增 `onSyncState` 函数。

在 return 语句之前（约第 135 行）添加：
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

然后在 return 对象中添加 `onSyncState`。

- [ ] **Step 4: VideoPlayer 接收新 props 并适配**

修改 `packages/shared/src/components/player/VideoPlayer.tsx`：

原 import（第 3 行）：
```typescript
import { useVideoSync } from "../../hooks/useVideoSync";
```

原 interface（第 7-10 行）：
```typescript
interface VideoPlayerProps {
  onFullscreen?: () => void;
  roomCode: string;
}
```

替换为：
```typescript
import type { SyncState } from "../../lib/sync";

interface VideoPlayerProps {
  onFullscreen?: () => void;
  roomCode: string;
  sendSyncState: (state: SyncState) => void;
  onSyncState: (handler: (state: SyncState) => void) => () => void;
}
```

原 hook 调用（第 17 行）：
```typescript
  useVideoSync(roomCode);
```

替换为：
```typescript
  useVideoSync(roomCode, sendSyncState, onSyncState);
```

- [ ] **Step 5: App.tsx 传递 socket 相关 props 给 VideoPlayer**

修改 `packages/web/src/App.tsx`：

原 useSocket 解构（第 9-12 行）：
```typescript
  const {
    connectionStatus, errorMessage, sendChatMessage,
    createRoom, joinRoom, checkRoom,
  } = useSocket(roomCode);
```

替换为：
```typescript
  const {
    connectionStatus, errorMessage, sendChatMessage,
    sendSyncState, onSyncState,
    createRoom, joinRoom, checkRoom,
  } = useSocket(roomCode);
```

原 VideoPlayer 调用（第 27 行）：
```typescript
          <VideoPlayer roomCode={roomCode} onFullscreen={() => setCinemaMode(true)} />
```

替换为：
```typescript
          <VideoPlayer
            roomCode={roomCode}
            sendSyncState={sendSyncState}
            onSyncState={onSyncState}
            onFullscreen={() => setCinemaMode(true)}
          />
```

- [ ] **Step 6: 更新 shared/index.ts 导出**

`useVideoSync` 新签名的类型需要导出。在 `packages/shared/src/index.ts` 中，`useVideoSync` 导出保持不变（第 25 行），因为函数名不变。

- [ ] **Step 7: 构建验证**

```bash
cd D:/clover-blue-planet
pnpm build:server
pnpm build:web
```

预期：两个构建均通过，无 TypeScript 错误。

- [ ] **Step 8: Commit**

```bash
cd D:/clover-blue-planet
git add packages/shared/src/hooks/useSocket.ts \
        packages/shared/src/hooks/useVideoSync.ts \
        packages/shared/src/components/player/VideoPlayer.tsx \
        packages/web/src/App.tsx
git commit -m "fix(client): remove dual socket connection in useVideoSync"
```

---

### Task 4: 客户端 — Socket 重连自动 re-join 房间

**Files:**
- Modify: `packages/shared/src/hooks/useSocket.ts` (行 22-28, 33-36, 84-89)
- Modify: `packages/shared/src/components/room/RoomConnector.tsx` (行 26-30)

**Interfaces:**
- Consumes: Task 1 的服务端修复（服务端 disconnect 清理 socketRoomMap）
- Produces: 重连时自动重新加入房间

- [ ] **Step 1: useSocket 中添加 connect 事件 re-join 逻辑**

在 `packages/shared/src/hooks/useSocket.ts` 中，修改 `connect` 事件处理器。

找到第 33-36 行：
```typescript
    socket.on("connect", () => {
      setConnectionStatus("connected");
      setErrorMessage(null);
    });
```

替换为：
```typescript
    socket.on("connect", () => {
      setConnectionStatus("connected");
      setErrorMessage(null);
      // 重连后自动重新加入房间
      if (roomCode) {
        socket.emit(ClientEvents.ROOM_JOIN, { code: roomCode });
      }
    });
```

- [ ] **Step 2: 确保首次连接不重复 join**

当前流程中，用户通过 RoomConnector 的 "创建房间" 或 "加入房间" 按钮触发 join。首次 connect 时 `roomCode` 存在但用户尚未点击按钮，`socket.emit(ClientEvents.ROOM_JOIN, ...)` 会被调用。但由于 Task 1 中房间创建时已自动 join，首次连接的 re-join 对创建者而言是冗余但无害的（房间已加入）。对通过 URL 分享直接进入的用户，这恰好保证他们自动 join。

同时需要在 roomCode 状态中追踪用户是否已"主动"加入过房间。引入一个 ref 来区分"首次连接"和"重连"。

修改 useSocket 内部，在 `socketRef` 声明下方（第 14 行后）添加：
```typescript
  const hasJoinedRef = useRef(false);
```

修改 connect 处理器为：
```typescript
    socket.on("connect", () => {
      setConnectionStatus("connected");
      setErrorMessage(null);
      // 仅重连时（已加入过房间）自动 re-join
      if (roomCode && hasJoinedRef.current) {
        socket.emit(ClientEvents.ROOM_JOIN, { code: roomCode });
      }
    });
```

在 `createRoom` 和 `joinRoom` 回调中设置标志：
```typescript
  const createRoom = useCallback(
    (code: string, password?: string) => {
      hasJoinedRef.current = true;
      socketRef.current?.emit(ClientEvents.ROOM_CREATE, { code, password });
    },
    [],
  );

  const joinRoom = useCallback((code: string, password?: string) => {
    setNeedPassword(false);
    hasJoinedRef.current = true;
    socketRef.current?.emit(ClientEvents.ROOM_JOIN, { code, password });
  }, []);
```

- [ ] **Step 3: 构建验证**

```bash
cd D:/clover-blue-planet && pnpm build:web
```

- [ ] **Step 4: Commit**

```bash
cd D:/clover-blue-planet
git add packages/shared/src/hooks/useSocket.ts
git commit -m "fix(client): auto re-join room on socket reconnect"
```

---

### Task 5: 存储层 — 异步 I/O + 防抖写盘

**Files:**
- Modify: `packages/server/src/db.ts` (行 1-91，几乎全文件)

**Interfaces:**
- Consumes: 无前置依赖
- Produces: `saveMessage` 和 `getRecentMessages` 接口不变，内部实现改为异步

- [ ] **Step 1: db.ts 完全重写为异步 + 防抖版本**

完整重写 `packages/server/src/db.ts`：

```typescript
import fs from "fs";
import path from "path";
import { EventEmitter } from "events";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

interface StoredMessage {
  id: number;
  room_code: string;
  sender: string;
  text: string;
  type: string;
  voice_url: string | null;
  timestamp: number;
}

let messages: StoredMessage[] = [];
let nextId = 1;

// ========== 初始化（异步） ==========

export const dbReady: Promise<void> = (async () => {
  try {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = await fs.promises.readFile(MESSAGES_FILE, "utf-8");
      const data = JSON.parse(raw);
      messages = data.messages || [];
      nextId = data.nextId || 1;
    }
  } catch (e) {
    console.error("[db] Failed to load messages, starting fresh:", (e as Error).message);
  }
})();

// ========== 防抖写盘 ==========

let saveTimer: NodeJS.Timeout | null = null;
let savePending = false;

function scheduleSave() {
  savePending = true;
  if (saveTimer) return; // 已有定时器，不重复创建
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    savePending = false;
    try {
      await fs.promises.writeFile(
        MESSAGES_FILE,
        JSON.stringify({ messages, nextId }),
        "utf-8",
      );
    } catch (e) {
      console.error("[db] Failed to save messages:", (e as Error).message);
    }
  }, 500); // 500ms 防抖窗口
}

// ========== 公开 API（接口不变） ==========

export function saveMessage(msg: {
  roomCode: string;
  sender: "me" | "partner";
  text: string;
  type: string;
  voiceUrl?: string;
  timestamp: number;
}): void {
  const stored: StoredMessage = {
    id: nextId++,
    room_code: msg.roomCode,
    sender: msg.sender,
    text: msg.text,
    type: msg.type,
    voice_url: msg.voiceUrl || null,
    timestamp: msg.timestamp,
  };
  messages.push(stored);

  // 保持每房间最多 1000 条
  trimRoomMessages(msg.roomCode);

  // 异步防抖写盘（不阻塞事件循环）
  scheduleSave();
}

export function getRecentMessages(roomCode: string, limit = 100): StoredMessage[] {
  return messages
    .filter((m) => m.room_code === roomCode)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .reverse();
}

export function getStats(): { totalMessages: number } {
  return { totalMessages: messages.length };
}

// ========== 内部辅助 ==========

function trimRoomMessages(roomCode: string): void {
  const roomMsgs = messages.filter((m) => m.room_code === roomCode);
  if (roomMsgs.length > 1000) {
    const toKeep = new Set(
      roomMsgs
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 1000)
        .map((m) => m.id),
    );
    messages = messages.filter(
      (m) => m.room_code !== roomCode || toKeep.has(m.id),
    );
  }
}

// 用于紧急退出时同步刷盘（可选，供 process.on('exit') 调用）
export function flushSync(): void {
  if (saveTimer) clearTimeout(saveTimer);
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify({ messages, nextId }), "utf-8");
  } catch (e) {
    console.error("[db] Failed to flush messages:", (e as Error).message);
  }
}
```

- [ ] **Step 2: 服务端入口处等待 dbReady + 注册退出刷盘**

修改 `packages/server/src/index.ts`，在 `import { getStats } from "./db"` 行附近添加 `import { dbReady, flushSync } from "./db"`。

在 `httpServer.listen(...)` 之前添加 `await dbReady`。由于顶层不能直接 await，将启动逻辑包装为 async IIFE：

找到第 89-110 行（`const httpServer = createServer(...)` 到 `httpServer.listen(...)`）：

原：
```typescript
const httpServer = createServer((req, res) => {
  // ...
});

const io = new Server(httpServer, { ... });
setupSocket(io);

httpServer.listen(PORT, () => {
  console.log(`🍀 ...`);
});
```

替换为：
```typescript
async function start() {
  await dbReady;
  console.log("[db] Messages loaded successfully");

  const httpServer = createServer((req, res) => {
    if (!handleAPI(req, res)) {
      if (req.url === "/" || req.url === "/health") {
        sendJSON(res, 200, { status: "ok" });
        return;
      }
      res.writeHead(200);
      res.end("🍀 四叶草蓝星球 信令服务器");
    }
  });

  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  setupSocket(io);

  // 优雅退出时刷盘
  process.on("SIGTERM", () => { flushSync(); process.exit(0); });
  process.on("SIGINT", () => { flushSync(); process.exit(0); });

  httpServer.listen(PORT, () => {
    console.log(`🍀 四叶草蓝星球 信令服务器 v${API_VERSION} 运行在 :${PORT}`);
    console.log(`   REST API: http://localhost:${PORT}/api/v${API_VERSION}/health`);
  });
}

start().catch((e) => {
  console.error("Failed to start server:", e);
  process.exit(1);
});
```

- [ ] **Step 3: 构建验证**

```bash
cd D:/clover-blue-planet && pnpm --filter server build
```

- [ ] **Step 4: Commit**

```bash
cd D:/clover-blue-planet
git add packages/server/src/db.ts packages/server/src/index.ts
git commit -m "fix(server): async debounced file I/O for message storage"
```

---

### Task 6: 视频播放器 — 添加 src 属性 + 语音消息修复 + Railway 构建

**Files:**
- Modify: `packages/shared/src/components/player/VideoPlayer.tsx` (行 1-6, 12-16, 37-41)
- Modify: `packages/shared/src/components/chat/MessageInput.tsx` (行 58-62)
- Modify: `railway.toml` (行 1-8)

**Interfaces:**
- Consumes: Task 3（VideoPlayer 新 props）、Task 5（无直接依赖）
- Produces: 视频可正常加载 src、语音 Blob 转为 base64 传输、Railway 用 pnpm 构建

- [ ] **Step 1: VideoPlayer 添加 source→src 绑定**

在 `packages/shared/src/components/player/VideoPlayer.tsx` 中，添加 `useEffect` 将 store 中的 `source` 同步到 `<video>` 元素的 `src` 属性。

在已有 `useEffect` 块之后（约第 31 行后）添加：
```typescript
  // 同步 source 到 video 元素
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !source) return;
    if (source.type === "file" && source.path) {
      v.src = `file://${source.path}`;
    } else if (source.type === "url" && source.url) {
      v.src = source.url;
    }
  }, [source]);
```

同时在 `<video>` 标签上添加 `src` 属性（即使被 useEffect 覆盖，初始值也应有占位）。这是可选的——useEffect 会在 source 变化时设置。

- [ ] **Step 2: 语音 Blob 转 base64 传输**

修改 `packages/shared/src/components/chat/MessageInput.tsx` 的 `VoiceRecorder` 使用处。

找到第 58-62 行：
```typescript
        <VoiceRecorder
          onRecorded={(blob) => {
            onSend("[语音消息]", "voice");
          }}
        />
```

替换为：
```typescript
        <VoiceRecorder
          onRecorded={(blob) => {
            // 将 Blob 转为 Base64 以通过 Socket.IO 传输
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              onSend(base64, "voice");
            };
            reader.readAsDataURL(blob);
          }}
        />
```

注意：这会使消息 `text` 字段承载完整的 base64 audio/webm 字符串。对于短语音（< 30 秒），webm 约为 50-200KB，在 Socket.IO 传输中是可行的临时方案。后续应改接 CDN 上传。

- [ ] **Step 3: Railway 构建改用 pnpm**

完整重写 `railway.toml`：

```toml
[build]
builder = "nixpacks"
buildCommand = "npm install -g pnpm@8 && pnpm install --filter server && pnpm --filter server build"

[deploy]
startCommand = "node packages/server/dist/index.js"
healthcheckPath = "/health"
restartPolicyType = "always"

[deploy.env]
DATA_DIR = "/data"
```

关键变更：
- `buildCommand` 先全局安装 pnpm，再用 pnpm 安装 server 包及 workspace 依赖
- `startCommand` 使用相对于项目根目录的路径（Railway 从项目根执行）
- 添加 `DATA_DIR` 环境变量指定持久化目录
- 移除过时的 `cd packages/server && npm install && npx tsc`

- [ ] **Step 4: 构建验证**

```bash
cd D:/clover-blue-planet
pnpm build:server
pnpm build:web
```

- [ ] **Step 5: Commit**

```bash
cd D:/clover-blue-planet
git add packages/shared/src/components/player/VideoPlayer.tsx \
        packages/shared/src/components/chat/MessageInput.tsx \
        railway.toml
git commit -m "fix: video src binding, voice base64 transport, railway pnpm build"
```

---

## 执行顺序总结

```
Task 1 (server: auto-join + sender) ──┐
Task 2 (server: auth + room limit) ──┤  可并行
Task 5 (server: async I/O)         ──┘

Task 3 (client: dual connection)  ──→  Task 4 (client: re-join)  ──→  Task 6 (client: video + voice + railway)

Task 1+2+5 与 Task 3 可并行执行（服务端 vs 客户端无代码冲突）
Task 4 依赖 Task 3 的 useSocket 修改
Task 6 依赖 Task 3 的 VideoPlayer props 修改
```

## 自检清单

- [ ] 所有 `old_string` 替换后代码结构正确、无缺失闭合括号
- [ ] `packages/shared/src/index.ts` 导出项与修改后的导入一致
- [ ] 服务端构建 → `pnpm --filter server build` 通过
- [ ] Web 端构建 → `pnpm build:web` 通过
- [ ] 无新增 `as any` 类型断言
- [ ] 无硬编码 secrets/API keys
- [ ] 未引入新的原生 C++ 依赖
