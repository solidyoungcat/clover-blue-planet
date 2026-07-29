import React, { useState } from "react";
import { VoiceRecorder } from "./VoiceRecorder";

const QUICK_EMOJIS = ["😊", "😂", "😍", "🥰", "❤️", "🎬", "🍿", "💕", "😭", "🤣", "🔥", "✨"];

interface MessageInputProps {
  onSend: (text: string, type: "text" | "emoji" | "voice") => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim(), "text");
    setText("");
  };

  const handleEmojiClick = (emoji: string) => {
    onSend(emoji, "emoji");
    setShowEmoji(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-ocean-700/20">
      {/* 表情面板 */}
      {showEmoji && (
        <div className="flex flex-wrap gap-0.5 px-3 py-2 bg-ocean-900/60 border-b border-ocean-700/20 animate-slide-up">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => handleEmojiClick(e)}
              className="text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ocean-700/50 hover:shadow-glow-sm transition-all"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* 输入栏 */}
      <div className="flex items-center gap-1.5 px-2.5 py-2">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className={`btn-ocean btn-sm !px-2 ${showEmoji ? "border-ocean-400/50 shadow-glow-sm" : ""}`}
        >
          😊
        </button>

        <VoiceRecorder
          onRecorded={(blob) => {
            // 将 Blob 转为 Base64 以通过 Socket.IO 传输
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              onSend(base64, "voice");
            };
            reader.readAsDataURL(blob);
          }}
        />

        <div className="flex-1 relative">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说点什么..."
            className="w-full bg-ocean-900/40 text-ocean-100 placeholder-ocean-600 rounded-xl px-4 py-2 text-sm outline-none border border-ocean-700/30 focus:border-ocean-500/50 focus:shadow-glow-sm transition-all"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="btn-primary btn-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          发送
        </button>
      </div>
    </div>
  );
}
