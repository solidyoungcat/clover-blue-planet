import React, { useState, useEffect } from "react";
import { VideoPlayer } from "../player/VideoPlayer";
import { useChatStore, type Message } from "../../stores/chatStore";
import { MessageInput } from "../chat/MessageInput";
import { PetDisplay } from "../pet/PetDisplay";
import type { SyncState } from "../../lib/sync";

interface CinemaModeProps {
  onExit: () => void;
  sendChatMessage: (msg: Message) => void;
  roomCode: string;
  sendSyncState: (state: SyncState) => void;
  onSyncState: (handler: (state: SyncState) => void) => () => void;
}

export function CinemaMode({
  onExit, sendChatMessage, roomCode,
  sendSyncState, onSyncState,
}: CinemaModeProps) {
  const [showControls, setShowControls] = useState(true);
  const messages = useChatStore((s) => s.messages);
  const lastMessage = messages[messages.length - 1];
  const addMessage = useChatStore((s) => s.addMessage);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [showControls]);

  useEffect(() => {
    const handleMouseMove = () => setShowControls(true);
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onExit(); };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

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
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 min-h-0">
        <VideoPlayer
          roomCode={roomCode}
          sendSyncState={sendSyncState}
          onSyncState={onSyncState}
        />
      </div>
      {showControls && (
        <div className="absolute bottom-[52px] left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <button onClick={onExit} className="text-white/80 hover:text-white text-sm">
            ⛶ 退出影院
          </button>
        </div>
      )}
      <div className="flex items-center gap-3 px-4 py-2" style={{ background: "rgba(8,47,73,0.7)", backdropFilter: "blur(8px)" }}>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {lastMessage && (
            <span className="text-ocean-200 text-sm truncate">
              💬 {lastMessage.sender === "me" ? "我" : "TA"}: {lastMessage.text}
            </span>
          )}
          <MessageInput onSend={handleSend} />
        </div>
        <PetDisplay compact />
      </div>
    </div>
  );
}
