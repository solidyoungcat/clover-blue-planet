// packages/shared/src/types/messages.ts
// 所有 Socket.IO 事件的精确类型定义

// ========== 聊天消息 ==========

export interface ChatMessage {
  id: string;
  sender: "me" | "partner";
  text: string;
  type: "text" | "emoji" | "voice";
  voiceUrl?: string;
  timestamp: number;
}

// ========== 同步状态 ==========

export interface SyncState {
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  timestamp: number;
}

// ========== 宠物状态 ==========

export interface PetState {
  petName: string;
  petType: "cat" | "dog" | "rabbit" | "hamster" | null;
  isActive: boolean;
  hunger: number;
  happiness: number;
  interactCount: number;
}

// ========== 客户端→服务端 事件 ==========

export interface RoomJoinPayload {
  code: string;
}

export interface RoomLeavePayload {
  code: string;
}

export interface ChatMessagePayload {
  roomCode: string;
  message: ChatMessage;
}

export interface SyncStatePayload {
  roomCode: string;
  state: SyncState;
}

export interface PetUpdatePayload {
  roomCode: string;
  petState: PetState;
}

// ========== 客户端→服务端 事件名 ==========

export const ClientEvents = {
  ROOM_CREATE: "room:create",
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  ROOM_CHECK: "room:check",
  CHAT_MESSAGE: "chat:message",
  SYNC_STATE: "sync:state",
  PET_UPDATE: "pet:update",
} as const;

// ========== 服务端→客户端 事件名 ==========

export const ServerEvents = {
  ROOM_CREATED: "room:created",
  ROOM_CHECK_RESULT: "room:check-result",
  ROOM_NEED_PASSWORD: "room:need-password",
  ROOM_LEFT: "room:left",
  PARTNER_JOINED: "room:partner-joined",
  PARTNER_LEFT: "room:partner-left",
  ERROR: "error",
  CHAT_MESSAGE: "chat:message",
  SYNC_STATE: "sync:state",
  PET_UPDATE: "pet:update",
} as const;

export const API_VERSION = 1;

// ========== 校验函数 ==========

export function isValidChatMessage(msg: unknown): msg is ChatMessage {
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

export function isValidSyncState(state: unknown): state is SyncState {
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

export function isValidPetState(state: unknown): state is PetState {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;
  return (
    typeof s.petName === "string" &&
    (s.petType === null || s.petType === "cat" || s.petType === "dog" || s.petType === "rabbit" || s.petType === "hamster") &&
    typeof s.isActive === "boolean" &&
    typeof s.hunger === "number" &&
    s.hunger >= 0 &&
    s.hunger <= 100 &&
    typeof s.happiness === "number" &&
    s.happiness >= 0 &&
    s.happiness <= 100 &&
    typeof s.interactCount === "number" &&
    s.interactCount >= 0
  );
}

export function isValidRoomCode(code: unknown): code is string {
  return typeof code === "string" && /^[A-Z0-9]{6}$/.test(code);
}
