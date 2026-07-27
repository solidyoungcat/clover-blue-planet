import React, { useState } from "react";
import {
  AppLayout, useRoomStore, RoomConnector, useSocket,
  ChatPanel, VideoPlayer, PlayerToolbar, CinemaMode,
} from "@clover/shared";

export function App() {
  const { roomCode, partnerOnline } = useRoomStore();
  const { isConnected, sendChatMessage } = useSocket(roomCode);
  const [cinemaMode, setCinemaMode] = useState(false);

  if (cinemaMode) {
    return <CinemaMode onExit={() => setCinemaMode(false)} sendChatMessage={sendChatMessage} roomCode={roomCode} />;
  }

  return (
    <AppLayout
      roomCode={roomCode}
      partnerOnline={partnerOnline}
      playerArea={
        <div className="flex flex-col flex-1 min-h-0">
          <RoomConnector />
          <VideoPlayer roomCode={roomCode} onFullscreen={() => setCinemaMode(true)} />
          <PlayerToolbar />
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
