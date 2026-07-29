# Task 2 Brief — 服务端：同步/宠物广播鉴权 + 房间人数上限

## Global Constraints
- 仅修改现有文件
- 保持现有事件名和 payload 结构不变
- 不引入任何原生 C++ 依赖
- 完成后运行 `cd D:/clover-blue-planet && pnpm --filter server build` 验证通过

## 改动

### 修改文件 A: `packages/server/src/socket.ts`

#### 改动 A1：sync:state 添加房间鉴权（行 214-221）

找到：
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

在 `if (!checkRateLimit...` 行之后添加一行鉴权：
```typescript
    socket.on("sync:state", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      if (!checkRateLimit(socket.id, "sync")) return;
      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (socketRoomMap.get(socket.id) !== d.roomCode) return;
      if (!isValidSyncState(d.state)) return;
      socket.to(d.roomCode).emit("sync:state", d.state);
    });
```

#### 改动 A2：pet:update 添加房间鉴权（行 223-230）

找到：
```typescript
    socket.on("pet:update", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      if (!checkRateLimit(socket.id, "pet")) return;
      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (!isValidPetState(d.petState)) return;
      socket.to(d.roomCode).emit("pet:update", d.petState);
    });
```

同样在速率限制检查后添加鉴权：
```typescript
    socket.on("pet:update", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      if (!checkRateLimit(socket.id, "pet")) return;
      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (socketRoomMap.get(socket.id) !== d.roomCode) return;
      if (!isValidPetState(d.petState)) return;
      socket.to(d.roomCode).emit("pet:update", d.petState);
    });
```

### 修改文件 B: `packages/server/src/rooms.ts`

#### 改动 B1：joinRoom 添加 2 人上限（行 50 之前）

找到：
```typescript
  room.users.add(socketId);
```

替换为：
```typescript
  // 房间最多 2 人（双人同步观影场景）
  if (room.users.size >= 2) {
    return { error: "房间已满（最多 2 人）" };
  }
  room.users.add(socketId);
```

## 验证
```bash
cd D:/clover-blue-planet && pnpm --filter server build
```
