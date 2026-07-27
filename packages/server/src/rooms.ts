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
