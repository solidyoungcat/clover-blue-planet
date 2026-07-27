import React, { useEffect, useRef } from "react";
import { useChatStore, type Message } from "../../stores/chatStore";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

interface ChatPanelProps {
  sendChatMessage: (msg: Message) => void;
}

export function ChatPanel({ sendChatMessage }: ChatPanelProps) {
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string, type: "text" | "emoji" | "voice") => {
    const msg: Message = {
      id: String(Date.now()),
      sender: "me",
      text,
      type,
      timestamp: Date.now(),
    };
    addMessage(msg);
    sendChatMessage(msg);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-ocean-700/50">
        <span className="text-ocean-300 text-sm">💬 聊天</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {messages.length === 0 && (
          <div className="text-center text-ocean-500 text-sm mt-8">
            还没有消息，说点什么吧 💬
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}
