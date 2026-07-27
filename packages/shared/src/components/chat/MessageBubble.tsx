import React from "react";
import type { Message } from "../../stores/chatStore";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.sender === "me";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2.5 px-3`}>
      <div
        className={`max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed animate-slide-up
          ${isMe
            ? "bg-gradient-to-br from-ocean-600/60 to-ocean-700/40 text-ocean-50 rounded-2xl rounded-br-md border border-ocean-500/20 shadow-glow-sm"
            : "bg-ocean-800/40 text-ocean-100 rounded-2xl rounded-bl-md border border-ocean-700/20"
          }
        `}
      >
        {message.type === "voice" ? (
          <div className="flex items-center gap-2 min-w-[100px]">
            <span className="text-sm">🔊</span>
            <span className="text-ocean-300 text-xs">语音 {Math.ceil((message.text?.length || 0) / 10)}″</span>
          </div>
        ) : (
          <span>{message.text}</span>
        )}
        <div className={`text-[10px] mt-1.5 tracking-wider ${isMe ? "text-ocean-300/70" : "text-ocean-500"}`}>
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
