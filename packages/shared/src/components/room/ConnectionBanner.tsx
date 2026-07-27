import React from "react";
import type { ConnectionStatus } from "../../hooks/useSocket";

interface ConnectionBannerProps {
  status: ConnectionStatus;
  message: string | null;
}

const STATUS_CONFIG: Record<ConnectionStatus, { bg: string; text: string; border: string; label: string; icon: string }> = {
  connected:    { bg: "bg-gradient-to-r from-emerald-950/60 to-emerald-900/20", text: "text-emerald-300", border: "border-emerald-500/20", label: "已连接", icon: "●" },
  connecting:   { bg: "bg-gradient-to-r from-ocean-900/60 to-ocean-800/20", text: "text-ocean-300", border: "border-ocean-500/20", label: "连接中…", icon: "◌" },
  reconnecting: { bg: "bg-gradient-to-r from-amber-950/60 to-amber-900/20", text: "text-amber-300", border: "border-amber-500/20", label: "重连中…", icon: "⟳" },
  disconnected: { bg: "bg-gradient-to-r from-red-950/60 to-red-900/20", text: "text-red-300", border: "border-red-500/20", label: "已断开", icon: "✕" },
};

export function ConnectionBanner({ status, message }: ConnectionBannerProps) {
  if (status === "connected" && !message) return null;

  const config = STATUS_CONFIG[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-wide border-b ${config.bg} ${config.text} ${config.border} animate-slide-up`}>
      <span className="text-xs">{config.icon}</span>
      <span className="font-medium">{config.label}</span>
      {message && <span className="text-white/50">— {message}</span>}
    </div>
  );
}
