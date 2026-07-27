import React from "react";
import { useRoomStore } from "../../stores/roomStore";

export function RoomConnector() {
  const { roomCode, partnerOnline, generateRoomCode } = useRoomStore();

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-ocean-900/60 text-sm">
      <span className="text-ocean-300 shrink-0">房间码:</span>
      <code className="text-ocean-100 font-mono text-lg tracking-wider">{roomCode}</code>
      <button
        onClick={copyRoomCode}
        className="text-ocean-400 hover:text-ocean-200 transition-colors"
      >
        📋复制
      </button>
      <button
        onClick={generateRoomCode}
        className="text-ocean-500 hover:text-ocean-300 transition-colors text-xs"
      >
        换一个
      </button>
      <div className="flex-1" />
      <span className={partnerOnline ? "text-green-400" : "text-ocean-500"}>
        ● {partnerOnline ? "TA 已加入" : "等待TA..."}
      </span>
    </div>
  );
}
