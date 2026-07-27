import React from "react";

interface TopBarProps {
  roomCode: string;
  partnerOnline: boolean;
  onCopyRoomCode: () => void;
  onOpenTheme: () => void;
  onOpenSettings: () => void;
}

export function TopBar({
  roomCode,
  partnerOnline,
  onCopyRoomCode,
  onOpenTheme,
  onOpenSettings,
}: TopBarProps) {
  return (
    <div
      className="flex items-center justify-between px-4 shrink-0 border-b border-ocean-700/50"
      style={{ height: 48, background: "rgba(12,74,110,0.6)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">🍀</span>
        <span className="font-heading text-ocean-100 text-base tracking-wide">
          四叶草蓝星球
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-ocean-200">
          <span>🔗 {roomCode}</span>
          <button
            onClick={onCopyRoomCode}
            className="text-ocean-400 hover:text-ocean-200 transition-colors text-xs"
          >
            📋复制
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={partnerOnline ? "text-green-400" : "text-ocean-500"}>●</span>
          <span className="text-ocean-300">TA{partnerOnline ? "在线" : "离线"}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onOpenTheme} className="p-1.5 text-ocean-300 hover:text-ocean-100 transition-colors">
          🎨
        </button>
        <button onClick={onOpenSettings} className="p-1.5 text-ocean-300 hover:text-ocean-100 transition-colors">
          ⚙️
        </button>
      </div>
    </div>
  );
}
