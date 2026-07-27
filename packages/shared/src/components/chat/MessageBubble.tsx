import React from "react";
import type { Message } from "../../stores/chatStore";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.sender === "me";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3 px-3`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? "bg-ocean-600 text-white rounded-br-md"
            : "bg-ocean-800/60 text-ocean-100 rounded-bl-md"
        }`}
      >
        {message.type === "voice" ? (
          <div className="flex items-center gap-2 min-w-[120px]">
            <span>🔊</span>
            <span>语音消息 {Math.ceil((message.text?.length || 0) / 10)}"</span>
          </div>
        ) : (
          <span>{message.text}</span>
        )}
        <div className={`text-[10px] mt-1 ${isMe ? "text-ocean-200" : "text-ocean-400"}`}>
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
