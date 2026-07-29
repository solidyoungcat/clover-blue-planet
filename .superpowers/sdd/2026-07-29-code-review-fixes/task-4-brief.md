# Task 4 Brief — 客户端：Socket 重连自动 re-join 房间

## Global Constraints
- 构建须通过 `cd D:/clover-blue-planet && pnpm build:web`
- 不改变现有事件名或 payload 结构

## 前置依赖
Task 3 已修改 `useSocket.ts`，当前文件已包含 `socketRef` 暴露和 `onSyncState` 函数。

## 改动

### 文件: `packages/shared/src/hooks/useSocket.ts`

#### 改动 A：添加 hasJoinedRef 追踪用户是否已加入过房间

在 `socketRef` 声明后（第 14 行附近）添加：
```typescript
  const hasJoinedRef = useRef(false);
```

#### 改动 B：修改 createRoom 回调 — 设置 hasJoined 标志

找到 `createRoom`（约第 91-96 行），在 emit 前添加标志设置：
```typescript
  const createRoom = useCallback(
    (code: string, password?: string) => {
      hasJoinedRef.current = true;
      socketRef.current?.emit(ClientEvents.ROOM_CREATE, { code, password });
    },
    [],
  );
```

#### 改动 C：修改 joinRoom 回调 — 设置 hasJoined 标志

找到 `joinRoom`（约第 98-101 行），在 emit 前添加标志设置：
```typescript
  const joinRoom = useCallback((code: string, password?: string) => {
    setNeedPassword(false);
    hasJoinedRef.current = true;
    socketRef.current?.emit(ClientEvents.ROOM_JOIN, { code, password });
  }, []);
```

#### 改动 D：修改 connect 事件处理器 — 重连时 re-join

找到 `socket.on("connect", ...)` 处理器（约第 33-36 行），当前可能已包含 Task 3 的改动。确保最终形式为：
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

如果 Task 3 在 connect 中已添加了 roomCode 判断，需要合并为：用 `hasJoinedRef.current` 包裹，避免首次连接时（用户尚未点击按钮）提前 join。

## 验证
```bash
cd D:/clover-blue-planet && pnpm build:web
```
