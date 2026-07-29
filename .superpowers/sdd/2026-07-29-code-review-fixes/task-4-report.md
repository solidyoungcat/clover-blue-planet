# Task 4 Report — Socket 重连自动 re-join 房间

## 状态: ✅ 完成

## 概述
在 `packages/shared/src/hooks/useSocket.ts` 中添加 `hasJoinedRef` 追踪用户是否已加入过房间，并修改 connect 事件处理器，在重连时自动 re-join。

## 改动细节

### 改动 A — hasJoinedRef 声明 (line 16)
```typescript
const hasJoinedRef = useRef(false);
```
新增于 `socketRef` 之后，用于追踪用户是否已主动调用过 `createRoom` 或 `joinRoom`。

### 改动 B — createRoom 设置标志 (line 99)
在 `socketRef.current?.emit(...)` 之前添加：
```typescript
hasJoinedRef.current = true;
```

### 改动 C — joinRoom 设置标志 (line 107)
在 `socketRef.current?.emit(...)` 之前添加：
```typescript
hasJoinedRef.current = true;
```

### 改动 D — connect 事件处理器 (lines 35-42)
在 `setErrorMessage(null)` 之后添加自动 re-join 逻辑：
```typescript
// 仅重连时（已加入过房间）自动 re-join
if (roomCode && hasJoinedRef.current) {
  socket.emit(ClientEvents.ROOM_JOIN, { code: roomCode });
}
```

此逻辑确保：
- 首次连接时（用户尚未点击创建/加入按钮）不会提前 join
- 重连时（socket.io 自动重连触发 connect 事件，且用户已加入过房间）自动 re-join

## 构建验证
```
cd D:/clover-blue-planet && pnpm build:web
```
**结果: ✅ 通过** — 101 modules transformed, built in 2.06s, 无错误。

## 文件变更
- `packages/shared/src/hooks/useSocket.ts` — 8 行新增（+hasJoinedRef 声明 + 3 处设置 + connect handler 中的 re-join 逻辑），173 行总计。
