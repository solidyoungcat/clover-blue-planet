import fs from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

// Ensure data directory
fs.mkdirSync(DATA_DIR, { recursive: true });

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

// Load from disk
try {
  if (fs.existsSync(MESSAGES_FILE)) {
    const data = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    messages = data.messages || [];
    nextId = data.nextId || 1;
  }
} catch {
  // Start fresh
}

function saveToDisk() {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify({ messages, nextId }), "utf-8");
  } catch (e) {
    console.error("[db] Failed to save messages:", e);
  }
}

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

  // Keep last 1000 per room
  cleanOldMessages(msg.roomCode);
  saveToDisk();
}

export function getRecentMessages(roomCode: string, limit = 100): StoredMessage[] {
  return messages
    .filter((m) => m.room_code === roomCode)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .reverse();
}

function cleanOldMessages(roomCode: string): void {
  const roomMessages = messages.filter((m) => m.room_code === roomCode);
  if (roomMessages.length > 1000) {
    const toKeep = roomMessages
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 1000)
      .map((m) => m.id);
    messages = messages.filter(
      (m) => m.room_code !== roomCode || toKeep.includes(m.id)
    );
  }
}

export function getStats(): { totalMessages: number } {
  return { totalMessages: messages.length };
}

export { messages as _messages };
