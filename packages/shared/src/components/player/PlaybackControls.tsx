import React from "react";
import { usePlayerStore } from "../../stores/playerStore";

interface PlaybackControlsProps {
  syncStatus: "connected" | "buffering" | "disconnected";
  onFullscreen?: () => void;
}

const SYNC_MAP: Record<string, { icon: string; label: string }> = {
  connected: { icon: "🟢", label: "已连接" },
  buffering: { icon: "🟡", label: "同步中" },
  disconnected: { icon: "🔴", label: "未连接" },
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

  return (
    <div className="px-3 py-2 bg-ocean-900/80">
      <div className="mb-2">
        <input
          type="range" min={0} max={duration || 0} value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full h-1 bg-ocean-700 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-ocean-400
            [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>
      <div className="flex items-center gap-3 text-sm">
        <button onClick={isPlaying ? pause : play} className="text-ocean-100 hover:text-ocean-300">
          {isPlaying ? "⏸" : "▶"}
        </button>
        <span className="text-ocean-400 text-xs tabular-nums w-[90px]">
          {fmt(currentTime)} / {fmt(duration)}
        </span>
        <button onClick={() => seek(Math.max(0, currentTime - 10))} className="text-ocean-500 hover:text-ocean-300 text-xs">↺10s</button>
        <button onClick={() => seek(Math.min(duration, currentTime + 10))} className="text-ocean-500 hover:text-ocean-300 text-xs">↦10s</button>
        <select value={playbackRate}
          onChange={(e) => setPlaybackRate(Number(e.target.value))}
          className="bg-ocean-800/50 text-ocean-300 text-xs rounded px-2 py-1 outline-none border border-ocean-700/50">
          {[0.5, 0.75, 1, 1.25, 1.5, 2, 3].map(r => <option key={r} value={r}>{r}x</option>)}
        </select>
        <input type="range" min={0} max={1} step={0.1} value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-20 h-1 bg-ocean-700 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-ocean-400" />
        <span className="text-ocean-500">🔊</span>
        <div className="flex-1" />
        <span className="text-xs text-ocean-400">{SYNC_MAP[syncStatus].icon} {SYNC_MAP[syncStatus].label}</span>
        <button className="text-ocean-500 hover:text-ocean-300 text-xs">📋字幕</button>
        {onFullscreen && (
          <button onClick={onFullscreen} className="text-ocean-400 hover:text-ocean-100 text-sm">⛶ 全屏</button>
        )}
      </div>
    </div>
  );
}
