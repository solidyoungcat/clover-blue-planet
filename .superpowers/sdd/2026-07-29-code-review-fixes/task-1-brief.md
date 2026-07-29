# Task 1 Brief — 服务端：创建者自动加入房间 + 消息 sender 服务端覆写

## Global Constraints
- 仅修改现有文件，不创建新文件
- 保持现有事件名和 payload 结构不变
- 不引入任何原生 C++ 依赖
- 完成后运行 `cd D:/clover-blue-planet && pnpm --filter server build` 验证通过

## 改动

### 修改文件: `packages/server/src/socket.ts`

#### 改动 A：创建者自动加入房间（行 127-131）

找到：
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

#### 改动 B：消息 sender 服务端强制覆写（行 193-211）

找到：
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
        sender: msg.sender,
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

## 验证
```bash
cd D:/clover-blue-planet && pnpm --filter server build
```
