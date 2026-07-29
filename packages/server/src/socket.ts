import type { Server, Socket } from "socket.io";
import {
  createRoom, joinRoom, leaveRoom, getPartnerId,
  hasPassword, roomExists, getUserCount, getRoomCount, getTotalUsers,
} from "./rooms";
import { saveMessage, getRecentMessages } from "./db";

// ========== 速率限制 ==========

const RATE_LIMITS = {
  chat: { windowMs: 1000, max: 5 },
  sync: { windowMs: 200, max: 5 },
  pet: { windowMs: 1000, max: 3 },
  room_create: { windowMs: 5000, max: 3 },
  room_join: { windowMs: 3000, max: 5 },
};

const rateLimitMap = new Map<string, Map<string, number[]>>();
const socketRoomMap = new Map<string, string>(); // socketId → roomCode

function checkRateLimit(socketId: string, event: keyof typeof RATE_LIMITS): boolean {
  const limit = RATE_LIMITS[event];
  if (!rateLimitMap.has(socketId)) rateLimitMap.set(socketId, new Map());
  const socketLimits = rateLimitMap.get(socketId)!;
  if (!socketLimits.has(event)) socketLimits.set(event, []);

  const now = Date.now();
  const timestamps = socketLimits.get(event)!;
  const valid = timestamps.filter((t) => now - t < limit.windowMs);
  if (valid.length >= limit.max) return false;
  valid.push(now);
  socketLimits.set(event, valid);
  return true;
}

function cleanupClient(socketId: string, code?: string) {
  rateLimitMap.delete(socketId);
  if (code) socketRoomMap.delete(socketId);
}

// ========== 字段校验 ==========

function isValidChatMessage(msg: unknown): boolean {
  if (!msg || typeof msg !== "object") return false;
  const m = msg as Record<string, unknown>;
  return (
    typeof m.id === "string" && (m.sender === "me" || m.sender === "partner") &&
    typeof m.text === "string" && m.text.length > 0 && m.text.length <= 2000 &&
    (m.type === "text" || m.type === "emoji" || m.type === "voice") &&
    typeof m.timestamp === "number"
  );
}

function isValidSyncState(state: unknown): boolean {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;
  return (
    typeof s.isPlaying === "boolean" && typeof s.currentTime === "number" &&
    s.currentTime >= 0 && typeof s.playbackRate === "number" &&
    s.playbackRate >= 0.1 && s.playbackRate <= 16 && typeof s.timestamp === "number"
  );
}

function isValidPetState(state: unknown): boolean {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;
  return (
    typeof s.petName === "string" &&
    (s.petType === null || s.petType === "cat" || s.petType === "dog" || s.petType === "rabbit" || s.petType === "hamster") &&
    typeof s.isActive === "boolean" && typeof s.hunger === "number" &&
    s.hunger >= 0 && s.hunger <= 100 && typeof s.happiness === "number" &&
    s.happiness >= 0 && s.happiness <= 100 && typeof s.interactCount === "number" &&
    s.interactCount >= 0
  );
}

const ROOM_CODE_RE = /^[A-Z0-9]{6}$/;

// ========== API 版本校验 ==========

const API_VERSION = 1;
const MIN_CLIENT_VERSION = 1;

function checkVersion(socket: Socket): boolean {
  const clientVersion = Number(socket.handshake.query.v);
  if (isNaN(clientVersion) || clientVersion < MIN_CLIENT_VERSION) {
    socket.emit("error", {
      message: `客户端版本过旧，请更新。需要 v${MIN_CLIENT_VERSION}+，当前 v${clientVersion || "未知"}`,
    });
    socket.disconnect();
    return false;
  }
  return true;
}

// ========== 主逻辑 ==========

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    if (!checkVersion(socket)) return;
    console.log(`[connect] ${socket.id} (total: ${io.engine.clientsCount})`);

    // --- 创建房间 ---
    socket.on("room:create", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;

      if (typeof d.code !== "string" || !ROOM_CODE_RE.test(d.code)) {
        socket.emit("error", { message: "无效的房间码" });
        return;
      }

      if (!checkRateLimit(socket.id, "room_create")) {
        socket.emit("error", { message: "创建房间过于频繁" });
        return;
      }

      if (roomExists(d.code)) {
        socket.emit("error", { message: "房间码已被使用，请换一个" });
        return;
      }

      const password = typeof d.password === "string" && d.password.length > 0
        ? d.password
        : undefined;

      const room = createRoom(d.code, password);

      // 创建者自动加入房间
      room.users.add(socket.id);
      socket.join(d.code);
      socketRoomMap.set(socket.id, d.code);

      socket.emit("room:created", { code: d.code, hasPassword: !!password });
      console.log(`[room:created] ${d.code} ${password ? "(加密)" : "(公开)"}`);
    });

    // --- 检查房间 ---
    socket.on("room:check", (code: unknown) => {
      if (typeof code !== "string" || !ROOM_CODE_RE.test(code)) {
        socket.emit("room:check-result", { exists: false, reason: "invalid" });
        return;
      }
      socket.emit("room:check-result", {
        exists: roomExists(code),
        hasPassword: hasPassword(code),
        userCount: getUserCount(code),
      });
    });

    // --- 加入房间 ---
    socket.on("room:join", (data: unknown) => {
      const code = typeof data === "string" ? data :
        (data && typeof data === "object" ? (data as Record<string, unknown>).code : undefined);
      const password = data && typeof data === "object"
        ? (data as Record<string, unknown>).password as string | undefined
        : undefined;

      if (typeof code !== "string" || !ROOM_CODE_RE.test(code)) {
        socket.emit("error", { message: "无效的房间码" });
        return;
      }

      if (!checkRateLimit(socket.id, "room_join")) {
        socket.emit("error", { message: "加入房间过于频繁" });
        return;
      }

      const result = joinRoom(code, socket.id, password);

      if ("error" in result) {
        if (result.error === "NEED_PASSWORD") {
          socket.emit("room:need-password", { code });
        } else {
          socket.emit("error", { message: result.error });
        }
        return;
      }

      socket.join(code);
      socketRoomMap.set(socket.id, code);
      if (result.partnerId) {
        io.to(result.partnerId).emit("room:partner-joined");
        socket.emit("room:partner-joined");
      }

      // 发送最近消息历史
      const history = getRecentMessages(code, 100);
      if (history.length > 0) {
        socket.emit("chat:history", history.reverse());
      }

      console.log(`[room:join] ${socket.id} → ${code}`);
    });

    // --- 聊天 / 同步 / 宠物（同前） ---
    socket.on("chat:message", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      if (!checkRateLimit(socket.id, "chat")) { socket.emit("error", { message: "消息发送过快" }); return; }
      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (!isValidChatMessage(d.message)) return;

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
      if (partner) {
        // 转发时强制覆写 sender，防止客户端伪造身份
        io.to(partner).emit("chat:message", { ...msg, sender: "partner" });
      }
    });

    socket.on("sync:state", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      if (!checkRateLimit(socket.id, "sync")) return;
      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (socketRoomMap.get(socket.id) !== d.roomCode) return;
      if (!isValidSyncState(d.state)) return;
      socket.to(d.roomCode).emit("sync:state", d.state);
    });

    socket.on("pet:update", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const d = data as Record<string, unknown>;
      if (!checkRateLimit(socket.id, "pet")) return;
      if (typeof d.roomCode !== "string" || !ROOM_CODE_RE.test(d.roomCode)) return;
      if (socketRoomMap.get(socket.id) !== d.roomCode) return;
      if (!isValidPetState(d.petState)) return;
      socket.to(d.roomCode).emit("pet:update", d.petState);
    });

    socket.on("room:leave", (code: unknown) => {
      if (typeof code !== "string") return;
      leaveRoom(code, socket.id);
      socket.leave(code);
      socket.emit("room:left");
      console.log(`[room:leave] ${socket.id} ← ${code}`);
    });

    socket.on("disconnect", (reason) => {
      const roomCode = socketRoomMap.get(socket.id);
      if (roomCode) {
        const remaining = leaveRoom(roomCode, socket.id);
        socket.leave(roomCode);
        // Notify partner
        if (remaining) {
          io.to(remaining).emit("room:partner-left");
        }
      }
      cleanupClient(socket.id, roomCode);
      console.log(`[disconnect] ${socket.id} (${reason})${roomCode ? ` ← ${roomCode}` : ""}`);
    });
  });
}
