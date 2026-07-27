import { createHash } from "crypto";

interface Room {
  code: string;
  users: Set<string>;
  passwordHash: string | null;  // null = no password
  createdAt: number;
}

const roomMap = new Map<string, Room>();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function createRoom(code: string, password?: string): Room {
  const room: Room = {
    code,
    users: new Set(),
    passwordHash: password ? hashPassword(password) : null,
    createdAt: Date.now(),
  };
  roomMap.set(code, room);
  return room;
}

export function joinRoom(
  code: string,
  socketId: string,
  password?: string
): { room: Room; partnerId: string | null } | { error: string } {
  let room = roomMap.get(code);
  if (!room) {
    return { error: "房间不存在" };
  }

  // 密码验证
  if (room.passwordHash && !password) {
    return { error: "NEED_PASSWORD" };
  }
  if (room.passwordHash && password && hashPassword(password) !== room.passwordHash) {
    return { error: "密码错误" };
  }

  room.users.add(socketId);

  const userIds = Array.from(room.users);
  const partnerId = userIds.length >= 2 ? userIds.find((id) => id !== socketId) ?? null : null;

  return { room, partnerId };
}

export function hasPassword(code: string): boolean {
  const room = roomMap.get(code);
  return room?.passwordHash != null;
}

export function roomExists(code: string): boolean {
  return roomMap.has(code);
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

export function getUserCount(code: string): number {
  return roomMap.get(code)?.users.size ?? 0;
}

export function getRoomCount(): number {
  return roomMap.size;
}

export function getTotalUsers(): number {
  let total = 0;
  for (const room of roomMap.values()) {
    total += room.users.size;
  }
  return total;
}

export { roomMap as rooms };
