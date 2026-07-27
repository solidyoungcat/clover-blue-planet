import React from "react";
import type { ConnectionStatus } from "../../hooks/useSocket";

interface ConnectionBannerProps {
  status: ConnectionStatus;
  message: string | null;
}

const STATUS_CONFIG: Record<ConnectionStatus, { bg: string; text: string; label: string }> = {
  connected: { bg: "bg-green-900/50", text: "text-green-300", label: "● 已连接" },
  connecting: { bg: "bg-ocean-800/50", text: "text-ocean-300", label: "◌ 连接中..." },
  reconnecting: { bg: "bg-amber-900/50", text: "text-amber-300", label: "⟳ 重连中..." },
  disconnected: { bg: "bg-red-900/50", text: "text-red-300", label: "● 已断开" },
};

export function ConnectionBanner({ status, message }: ConnectionBannerProps) {
  if (status === "connected" && !message) return null;

  const config = STATUS_CONFIG[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1 text-xs ${config.bg} ${config.text}`}>
      <span>{config.label}</span>
      {message && <span className="text-white/70">— {message}</span>}
    </div>
  );
}
