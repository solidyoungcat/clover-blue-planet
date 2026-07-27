import React from "react";
import { AppLayout, useRoomStore, RoomConnector, useSocket, ChatPanel } from "@clover/shared";

export function App() {
  const { roomCode, partnerOnline } = useRoomStore();
  const { isConnected, sendChatMessage, sendSyncState } = useSocket(roomCode);

  return (
    <AppLayout
      roomCode={roomCode}
      partnerOnline={partnerOnline}
      playerArea={
        <div className="flex flex-col flex-1 min-h-0">
          <RoomConnector />
          <div className="flex-1 flex items-center justify-center text-ocean-400 text-lg">
            📺 等待开始观影...
          </div>
        </div>
      }
      chatArea={
        <ChatPanel sendChatMessage={sendChatMessage} />
      }
      onCopyRoomCode={() => navigator.clipboard.writeText(roomCode)}
      onOpenTheme={() => {}}
      onOpenSettings={() => {}}
    />
  );
}
