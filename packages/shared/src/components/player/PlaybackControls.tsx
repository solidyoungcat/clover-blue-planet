import React from "react";
import { usePlayerStore } from "../../stores/playerStore";

interface PlaybackControlsProps {
  syncStatus: "connected" | "buffering" | "disconnected";
  onFullscreen?: () => void;
}

const SYNC_MAP: Record<string, { icon: string; label: string; color: string }> = {
  connected: { icon: "●", label: "已同步", color: "text-emerald-400" },
  buffering: { icon: "◌", label: "同步中", color: "text-amber-400" },
  disconnected: { icon: "○", label: "未连接", color: "text-ocean-500" },
};

export function PlaybackControls({ syncStatus, onFullscreen }: PlaybackControlsProps) {
  const {
    isPlaying, currentTime, duration, playbackRate, volume,
    play, pause, seek, setPlaybackRate, setVolume,
  } = usePlayerStore();

  const fmt = (s: number) => {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const sync = SYNC_MAP[syncStatus];

  return (
    <div className="px-3 py-2 bg-gradient-to-t from-ocean-950/90 to-ocean-900/60 border-t border-ocean-700/20">
      {/* 进度条 */}
      <div className="mb-2 group">
        <input
          type="range" min={0} max={duration || 0} value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
            bg-ocean-800/60
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5
            [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-ocean-400
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-glow-sm
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
            hover:[&::-webkit-slider-thumb]:scale-125 hover:[&::-webkit-slider-thumb]:shadow-glow
            group-hover:h-2 transition-all"
        />
      </div>

      {/* 控制栏 */}
      <div className="flex items-center gap-2 text-sm">
        {/* 播放/暂停 */}
        <button
          onClick={isPlaying ? pause : play}
          className="btn-ocean p-1.5 !rounded-lg text-sm leading-none"
          title={isPlaying ? "暂停" : "播放"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {/* 时间 */}
        <span className="text-ocean-400 text-[11px] tabular-nums w-[90px] tracking-wider font-mono">
          {fmt(currentTime)} / {fmt(duration)}
        </span>

        {/* 快退/快进 */}
        <button onClick={() => seek(Math.max(0, currentTime - 10))} className="btn-ocean btn-sm text-ocean-400">
          ↺10s
        </button>
        <button onClick={() => seek(Math.min(duration, currentTime + 10))} className="btn-ocean btn-sm text-ocean-400">
          ↦10s
        </button>

        {/* 倍速 */}
        <select
          value={playbackRate}
          onChange={(e) => setPlaybackRate(Number(e.target.value))}
          className="btn-ocean btn-sm !pr-6 appearance-none cursor-pointer bg-[right_0.25rem_center] bg-[length:0.6rem]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 8 12'%3E%3Cpath stroke='%2338BDF8' stroke-linecap='round' d='m1 3.5 3 3 3-3'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat" }}
        >
          {[0.5, 0.75, 1, 1.25, 1.5, 2, 3].map(r => (
            <option key={r} value={r} className="bg-ocean-900">{r}x</option>
          ))}
        </select>

        {/* 音量 */}
        <input
          type="range" min={0} max={1} step={0.05} value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-16 h-1 bg-ocean-800/60 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-ocean-400
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
            hover:[&::-webkit-slider-thumb]:shadow-glow-sm transition-all"
          title={`音量 ${Math.round(volume * 100)}%`}
        />

        <div className="flex-1" />

        {/* 同步状态 */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] tracking-wide
          ${syncStatus === "connected" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : ""}
          ${syncStatus === "buffering" ? "border-amber-500/20 bg-amber-500/5 text-amber-300" : ""}
          ${syncStatus === "disconnected" ? "border-ocean-700/30 bg-ocean-900/30 text-ocean-500" : ""}
        `}>
          <span className={sync.color}>{sync.icon}</span>
          <span>{sync.label}</span>
        </div>

        {/* 字幕 */}
        <button className="btn-ocean btn-sm">
          📋字幕
        </button>

        {/* 全屏 */}
        {onFullscreen && (
          <button onClick={onFullscreen} className="btn-primary btn-sm">
            ⛶ 影院
          </button>
        )}
      </div>
    </div>
  );
}
