import React from "react";
import {
  AppLayout, useRoomStore, RoomConnector, useSocket,
  ChatPanel, VideoPlayer,
} from "@clover/shared";

export function App() {
  const { roomCode, partnerOnline } = useRoomStore();
  const { isConnected, sendChatMessage } = useSocket(roomCode);

  return (
    <AppLayout
      roomCode={roomCode}
      partnerOnline={partnerOnline}
      playerArea={
        <div className="flex flex-col flex-1 min-h-0">
          <RoomConnector />
          <VideoPlayer roomCode={roomCode} />
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
