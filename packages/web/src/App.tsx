import React from "react";
import { AppLayout } from "@clover/shared";

export function App() {
  return (
    <AppLayout
      roomCode="------"
      partnerOnline={false}
      playerArea={
        <div className="flex-1 flex items-center justify-center text-ocean-400 text-lg">
          📺 等待开始观影...
        </div>
      }
      chatArea={
        <div className="flex-1 flex items-center justify-center text-ocean-400 text-lg">
          💬 聊天区域
        </div>
      }
      onCopyRoomCode={() => {}}
      onOpenTheme={() => {}}
      onOpenSettings={() => {}}
    />
  );
}
