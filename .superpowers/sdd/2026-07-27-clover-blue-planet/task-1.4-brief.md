# Task 1.4: 信令服务器 — Socket.IO 房间管理

**Files:**
- Create: `packages/server/src/index.ts`
- Create: `packages/server/src/socket.ts`
- Create: `packages/server/src/rooms.ts`

**Interfaces:**
- Consumes: Task 1.1 (server package scaffolded)
- Produces:
  - Socket.IO server on port 3001 (CORS: origin "*")
  - Events: `room:join`, `room:leave`, `room:partner-joined`, `room:partner-left`
  - Events: `chat:message` (relay), `sync:state` (relay), `pet:update` (relay)

---

### Step 1: `packages/server/src/rooms.ts`

```typescript
interface Room {
  code: string;
  users: Set<string>;
}

const roomMap = new Map<string, Room>();

export function joinRoom(code: string, socketId: string): { room: Room; partnerId: string | null } {
  let room = roomMap.get(code);
  if (!room) {
    room = { code, users: new Set() };
    roomMap.set(code, room);
  }
  room.users.add(socketId);

  const userIds = Array.from(room.users);
  const partnerId = userIds.length >= 2 ? userIds.find((id) => id !== socketId) ?? null : null;

  return { room, partnerId };
}

export function leaveRoom(code: string, socketId: string): string | null {
  const room = roomMap.get(code);
  if (!room) return null;
  room.users.delete(socketId);
  if (room.users.size === 0) {
    roomMap.delete(code);
    return null;
  }
  return Array.from(room.users)[0];
}

export function getPartnerId(code: string, socketId: string): string | null {
  const room = roomMap.get(code);
  if (!room) return null;
  const ids = Array.from(room.users).filter((id) => id !== socketId);
  return ids[0] ?? null;
}

// Export for disconnect cleanup
export { roomMap as rooms };
```

### Step 2: `packages/server/src/socket.ts`

```typescript
import type { Server, Socket } from "socket.io";
import { joinRoom, leaveRoom, getPartnerId } from "./rooms";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`[connect] ${socket.id}`);

    socket.on("room:join", (code: string) => {
      socket.join(code);
      const { partnerId } = joinRoom(code, socket.id);

      if (partnerId) {
        io.to(partnerId).emit("room:partner-joined");
        socket.emit("room:partner-joined");
      }

      console.log(`[room:join] ${socket.id} → ${code}`);
    });

    socket.on("room:leave", (code: string) => {
      leaveRoom(code, socket.id);
      socket.leave(code);
      console.log(`[room:leave] ${socket.id} ← ${code}`);
    });

    socket.on("chat:message", (data: { roomCode: string; message: unknown }) => {
      const partner = getPartnerId(data.roomCode, socket.id);
      if (partner) io.to(partner).emit("chat:message", data.message);
    });

    socket.on("sync:state", (data: { roomCode: string; state: unknown }) => {
      socket.to(data.roomCode).emit("sync:state", data.state);
    });

    socket.on("pet:update", (data: { roomCode: string; petState: unknown }) => {
      socket.to(data.roomCode).emit("pet:update", data.petState);
    });

    socket.on("disconnect", () => {
      console.log(`[disconnect] ${socket.id}`);
    });
  });
}
```

### Step 3: `packages/server/src/index.ts`

```typescript
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socket";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

setupSocket(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🍀 四叶草蓝星球 信令服务器运行在 :${PORT}`);
});
```

### Step 4: 验证 `pnpm dev:server` → 输出 "🍀 四叶草蓝星球 信令服务器运行在 :3001"
### Step 5: Commit `git add -A && git commit -m "feat: add Socket.IO signaling server with room management"`
