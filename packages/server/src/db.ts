import fs from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

interface StoredMessage {
  id: number;
  room_code: string;
  sender: string;
  text: string;
  type: string;
  voice_url: string | null;
  timestamp: number;
}

let messages: StoredMessage[] = [];
let nextId = 1;

// ========== 初始化（异步） ==========

export const dbReady: Promise<void> = (async () => {
  try {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = await fs.promises.readFile(MESSAGES_FILE, "utf-8");
      const data = JSON.parse(raw);
      messages = data.messages || [];
      nextId = data.nextId || 1;
    }
  } catch (e) {
    console.error("[db] Failed to load messages, starting fresh:", (e as Error).message);
  }
})();

// ========== 防抖写盘 ==========

let saveTimer: NodeJS.Timeout | null = null;

function scheduleSave() {
  if (saveTimer) return; // 已有定时器，等待触发
  saveTimer = setTimeout(async () => {
    saveTimer = null;
    try {
      await fs.promises.writeFile(
        MESSAGES_FILE,
        JSON.stringify({ messages, nextId }),
        "utf-8",
      );
    } catch (e) {
      console.error("[db] Failed to save messages:", (e as Error).message);
    }
  }, 500); // 500ms 防抖窗口
}

// ========== 公开 API（接口不变） ==========

export function saveMessage(msg: {
  roomCode: string;
  sender: "me" | "partner";
  text: string;
  type: string;
  voiceUrl?: string;
  timestamp: number;
}): void {
  const stored: StoredMessage = {
    id: nextId++,
    room_code: msg.roomCode,
    sender: msg.sender,
    text: msg.text,
    type: msg.type,
    voice_url: msg.voiceUrl || null,
    timestamp: msg.timestamp,
  };
  messages.push(stored);

  // 保持每房间最多 1000 条
  trimRoomMessages(msg.roomCode);

  // 异步防抖写盘（不阻塞事件循环）
  scheduleSave();
}

export function getRecentMessages(roomCode: string, limit = 100): StoredMessage[] {
  return messages
    .filter((m) => m.room_code === roomCode)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .reverse();
}

export function getStats(): { totalMessages: number } {
  return { totalMessages: messages.length };
}

// ========== 内部辅助 ==========

function trimRoomMessages(roomCode: string): void {
  const roomMsgs = messages.filter((m) => m.room_code === roomCode);
  if (roomMsgs.length > 1000) {
    const toKeep = new Set(
      roomMsgs
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 1000)
        .map((m) => m.id),
    );
    messages = messages.filter(
      (m) => m.room_code !== roomCode || toKeep.has(m.id),
    );
  }
}

// 紧急退出时同步刷盘（供 process.on('exit') 调用）
export function flushSync(): void {
  if (saveTimer) clearTimeout(saveTimer);
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify({ messages, nextId }), "utf-8");
  } catch (e) {
    console.error("[db] Failed to flush messages:", (e as Error).message);
  }
}
