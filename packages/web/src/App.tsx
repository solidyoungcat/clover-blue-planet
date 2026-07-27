import React, { useState } from "react";
import {
  AppLayout, useRoomStore, RoomConnector, useSocket,
  ChatPanel, VideoPlayer, PlayerToolbar, CinemaMode, ConnectionBanner,
} from "@clover/shared";

export function App() {
  const { roomCode, partnerOnline } = useRoomStore();
  const {
    connectionStatus, errorMessage, sendChatMessage,
    createRoom, joinRoom, checkRoom,
  } = useSocket(roomCode);
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
          <ConnectionBanner status={connectionStatus} message={errorMessage} />
          <RoomConnector createRoom={createRoom} joinRoom={joinRoom} checkRoom={checkRoom} />
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
