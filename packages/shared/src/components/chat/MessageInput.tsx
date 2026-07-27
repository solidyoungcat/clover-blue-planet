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
    <div className="border-t border-ocean-700/50">
      {showEmoji && (
        <div className="flex flex-wrap gap-1 px-3 py-2 bg-ocean-900/80">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => handleEmojiClick(e)}
              className="text-xl hover:bg-ocean-700 rounded p-1 transition-colors"
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="text-ocean-300 hover:text-ocean-100 transition-colors text-lg"
        >
          😊
        </button>
        <VoiceRecorder
          onRecorded={(blob) => {
            const url = URL.createObjectURL(blob);
            onSend("[语音消息]", "voice");
          }}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="说点什么..."
          className="flex-1 bg-ocean-800/50 text-ocean-100 placeholder-ocean-500 rounded-full px-4 py-1.5 text-sm outline-none border border-ocean-700/50 focus:border-ocean-400 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="text-ocean-300 hover:text-ocean-100 disabled:text-ocean-700 transition-colors"
        >
          📎
        </button>
      </div>
    </div>
  );
}
