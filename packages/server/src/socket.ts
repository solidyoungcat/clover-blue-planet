import type { Server, Socket } from "socket.io";
import { joinRoom, leaveRoom, getPartnerId } from "./rooms";

// ========== 速率限制 ==========

const RATE_LIMITS = {
  chat: { windowMs: 1000, max: 5 },      // 每秒最多 5 条消息
  sync: { windowMs: 200, max: 5 },        // 每 200ms 最多 5 次同步
  pet: { windowMs: 1000, max: 3 },        // 每秒最多 3 次宠物更新
};

const rateLimitMap = new Map<string, Map<string, number[]>>();

function checkRateLimit(
  socketId: string,
  event: keyof typeof RATE_LIMITS
): boolean {
  const limit = RATE_LIMITS[event];
  if (!rateLimitMap.has(socketId)) {
    rateLimitMap.set(socketId, new Map());
  }
  const socketLimits = rateLimitMap.get(socketId)!;
  if (!socketLimits.has(event)) {
    socketLimits.set(event, []);
  }

  const now = Date.now();
  const timestamps = socketLimits.get(event)!;
  // 清理过期记录
  const valid = timestamps.filter((t) => now - t < limit.windowMs);
  if (valid.length >= limit.max) return false;
  valid.push(now);
  socketLimits.set(event, valid);
  return true;
}

// ========== 简化版字段校验（服务端无法 import shared types） ==========

function isValidChatMessage(msg: unknown): boolean {
  if (!msg || typeof msg !== "object") return false;
  const m = msg as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    (m.sender === "me" || m.sender === "partner") &&
    typeof m.text === "string" &&
    m.text.length > 0 &&
    m.text.length <= 2000 &&
    (m.type === "text" || m.type === "emoji" || m.type === "voice") &&
    typeof m.timestamp === "number"
  );
}

function isValidSyncState(state: unknown): boolean {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;
  return (
    typeof s.isPlaying === "boolean" &&
    typeof s.currentTime === "number" &&
    s.currentTime >= 0 &&
    typeof s.playbackRate === "number" &&
    s.playbackRate >= 0.1 &&
    s.playbackRate <= 16 &&
    typeof s.timestamp === "number"
  );
}

function isValidPetState(state: unknown): boolean {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;
  return (
    typeof s.petName === "string" &&
    (s.petType === null || s.petType === "cat" || s.petType === "dog" || s.petType === "rabbit" || s.petType === "hamster") &&
    typeof s.isActive === "boolean" &&
    typeof s.hunger === "number" && s.hunger >= 0 && s.hunger <= 100 &&
    typeof s.happiness === "number" && s.happiness >= 0 && s.happiness <= 100 &&
    typeof s.interactCount === "number" && s.interactCount >= 0
  );
}

const ROOM_CODE_RE = /^[A-Z0-9]{6}$/;

// ========== 主逻辑 ==========

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`[connect] ${socket.id} (total: ${io.engine.clientsCount})`);

    // --- 房间加入 ---
    socket.on("room:join", (code: unknown) => {
      if (typeof code !== "string" || !ROOM_CODE_RE.test(code)) {
        socket.emit("error", { message: "无效的房间码（6位大写字母/数字）" });
        return;
      }

      socket.join(code);
      const { partnerId } = joinRoom(code, socket.id);

      if (partnerId) {
        io.to(partnerId).emit("room:partner-joined");
        socket.emit("room:partner-joined");
      }

      console.log(`[room:join] ${socket.id} → ${code}`);
    });

    // --- 聊天消息 ---
    socket.on("chat:message", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;

      if (!checkRateLimit(socket.id, "chat")) {
        socket.emit("error", { message: "消息发送过快，请稍后" });
        return;
      }

      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (!isValidChatMessage(d.message)) return;

      const partner = getPartnerId(d.roomCode, socket.id);
      if (partner) io.to(partner).emit("chat:message", d.message);
    });

    // --- 同步状态 ---
    socket.on("sync:state", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;

      if (!checkRateLimit(socket.id, "sync")) return;
      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (!isValidSyncState(d.state)) return;

      socket.to(d.roomCode).emit("sync:state", d.state);
    });

    // --- 宠物更新 ---
    socket.on("pet:update", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;

      if (!checkRateLimit(socket.id, "pet")) return;
      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (!isValidPetState(d.petState)) return;

      socket.to(d.roomCode).emit("pet:update", d.petState);
    });

    // --- 离开房间 ---
    socket.on("room:leave", (code: unknown) => {
      if (typeof code !== "string") return;
      leaveRoom(code, socket.id);
      socket.leave(code);
      console.log(`[room:leave] ${socket.id} ← ${code}`);
    });

    // --- 断线 ---
    socket.on("disconnect", (reason) => {
      console.log(`[disconnect] ${socket.id} (${reason})`);
    });
  });
}
