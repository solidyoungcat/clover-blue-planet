import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "clover.db");

// Ensure directory exists
import fs from "fs";
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_code TEXT NOT NULL,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    voice_url TEXT,
    timestamp INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_code, timestamp DESC);
`);

export interface StoredMessage {
  id: number;
  room_code: string;
  sender: string;
  text: string;
  type: string;
  voice_url: string | null;
  timestamp: number;
}

// Insert a message
const insertStmt = db.prepare(`
  INSERT INTO messages (room_code, sender, text, type, voice_url, timestamp)
  VALUES (@roomCode, @sender, @text, @type, @voiceUrl, @timestamp)
`);

export function saveMessage(msg: {
  roomCode: string;
  sender: "me" | "partner";
  text: string;
  type: string;
  voiceUrl?: string;
  timestamp: number;
}): void {
  insertStmt.run({
    roomCode: msg.roomCode,
    sender: msg.sender,
    text: msg.text,
    type: msg.type,
    voiceUrl: msg.voiceUrl || null,
    timestamp: msg.timestamp,
  });
}

// Get recent messages for a room
const queryStmt = db.prepare(`
  SELECT * FROM messages
  WHERE room_code = @roomCode
  ORDER BY timestamp DESC
  LIMIT @limit
`);

export function getRecentMessages(roomCode: string, limit = 100): StoredMessage[] {
  return queryStmt.all({ roomCode, limit }) as StoredMessage[];
}

// Clean old messages (keep last 1000 per room)
const cleanStmt = db.prepare(`
  DELETE FROM messages
  WHERE room_code = @roomCode
  AND id NOT IN (
    SELECT id FROM messages
    WHERE room_code = @roomCode
    ORDER BY timestamp DESC
    LIMIT 1000
  )
`);

export function cleanOldMessages(roomCode: string): void {
  cleanStmt.run({ roomCode });
}

// Get database stats
export function getStats(): { totalMessages: number; dbSize: string } {
  const count = (db.prepare("SELECT COUNT(*) as c FROM messages").get() as { c: number }).c;
  const size = fs.statSync(DB_PATH).size;
  return {
    totalMessages: count,
    dbSize: `${(size / 1024).toFixed(1)} KB`,
  };
}

export default db;
