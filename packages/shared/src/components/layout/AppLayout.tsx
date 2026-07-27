import React, { type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { ResizableSplit } from "./ResizableSplit";

interface AppLayoutProps {
  roomCode: string;
  partnerOnline: boolean;
  playerArea: ReactNode;
  chatArea: ReactNode;
  onCopyRoomCode: () => void;
  onOpenTheme: () => void;
  onOpenSettings: () => void;
}

export function AppLayout({
  roomCode,
  partnerOnline,
  playerArea,
  chatArea,
  onCopyRoomCode,
  onOpenTheme,
  onOpenSettings,
}: AppLayoutProps) {
  return (
    <div className="h-screen w-screen flex flex-col bg-ocean-950 overflow-hidden">
      <TopBar
        roomCode={roomCode}
        partnerOnline={partnerOnline}
        onCopyRoomCode={onCopyRoomCode}
        onOpenTheme={onOpenTheme}
        onOpenSettings={onOpenSettings}
      />
      <ResizableSplit left={playerArea} right={chatArea} />
    </div>
  );
}
