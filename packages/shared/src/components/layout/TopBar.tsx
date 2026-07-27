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
      className="flex items-center justify-between px-4 shrink-0 border-b border-ocean-700/30"
      style={{
        height: 48,
        background: "linear-gradient(180deg, rgba(12,74,110,0.7) 0%, rgba(8,47,73,0.6) 100%)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* 左侧 Logo */}
      <div className="flex items-center gap-3">
        <span className="text-xl select-none">🍀</span>
        <span className="font-heading text-ocean-100 text-[15px] tracking-[0.04em]">
          四叶草蓝星球
        </span>
      </div>

      {/* 中间：房间信息 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-ocean-700/30 bg-ocean-900/40">
          <span className="text-ocean-400 text-[11px] tracking-wider">房间</span>
          <code className="text-ocean-100 font-mono text-sm tracking-[0.15em] font-medium">
            {roomCode}
          </code>
          <button
            onClick={onCopyRoomCode}
            className="btn-ocean btn-sm ml-1"
            title="复制房间码"
          >
            复制
          </button>
        </div>

        {/* 在线状态 */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs ${
            partnerOnline
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-ocean-700/30 bg-ocean-900/40 text-ocean-400"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${partnerOnline ? "bg-emerald-400 shadow-glow-sm" : "bg-ocean-600"}`} />
          <span className="tracking-wide">
            {partnerOnline ? "TA 在线" : "等待加入"}
          </span>
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenTheme}
          className="btn-ocean btn-sm"
          title="主题设置"
        >
          🎨
        </button>
        <button
          onClick={onOpenSettings}
          className="btn-ocean btn-sm"
          title="设置"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}
