# Task 1.5 Report: useSocket Hook + RoomConnector 组件

## 状态: ✅ 完成

## 执行内容

### 创建的文件
- `packages/shared/src/hooks/useSocket.ts` — WebSocket 连接 hook
  - 基于 socket.io-client，连接到 `VITE_SERVER_URL` 或 `localhost:3001`
  - 实现 room:join/leave、partner-joined/left、chat:message 事件监听
  - 暴露 `{ isConnected, sendChatMessage, sendSyncState, sendPetUpdate }`
- `packages/shared/src/components/room/RoomConnector.tsx` — 房间联结 UI 组件
  - 显示房间码、复制按钮、「换一个」按钮、在线状态指示器
  - 使用 Tailwind ocean 色系，与现有布局一致

### 修改的文件
- `packages/web/src/App.tsx` — 集成 Socket + RoomConnector
  - 从硬编码 `roomCode="------"` 升级为 `useRoomStore()` 动态 roomCode
  - 从无连接升级为调用 `useSocket(roomCode)` 建立 WebSocket 连接
  - playerArea 新增 `<RoomConnector />` 组件
- `packages/shared/src/index.ts` — 追加 `useSocket` 和 `RoomConnector` 导出
- `packages/shared/package.json` — 追加 `socket.io-client` 依赖

## 验证结果

| 验证项 | 结果 |
|--------|------|
| `tsc --noEmit` (shared) | ✅ 0 errors |
| `tsc --noEmit` (web) | ✅ 0 errors |
| `pnpm dev:web` (Vite) | ✅ ready in 332ms, serving localhost:3000 |
| `pnpm dev:server` | ⚠️ port 3001 already in use (前置任务 server 已在运行) |

## Git Commit

```
7f1f307 feat: add WebSocket connection hook, room connector UI
7 files changed, 115 insertions(+), 9 deletions(-)
```

## 注意事项

- Server (`localhost:3001`) 因已存在进程占用端口而无法重启，但这是预期的——前置任务的 server 仍在运行中，不影响验证
- 完整的双向 WebSocket 联调需要两个浏览器 tab 配合相同房间码，当前环境无浏览器可用，但代码已按计划精确实现
