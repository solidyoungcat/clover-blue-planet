# Task 2.2: 视频播放器 — VideoPlayer + SourceSelector + PlaybackControls

**Files:**
- Create: `packages/shared/src/components/player/VideoPlayer.tsx`
- Create: `packages/shared/src/components/player/SourceSelector.tsx`
- Create: `packages/shared/src/components/player/PlaybackControls.tsx`
- Modify: `packages/web/src/App.tsx` (use VideoPlayer)
- Modify: `packages/shared/src/index.ts` (追加 exports)

**Interfaces:**
- Consumes: Task 1.3 (playerStore)
- Produces:
  - `VideoPlayer` — uses usePlayerStore, renders `<video>` element, props: `{ onFullscreen?: () => void }`
  - `SourceSelector` — 打开本地文件 / 输入 URL
  - `PlaybackControls` — 播放/暂停/进度/倍速/音量/字幕，props: `{ syncStatus, onFullscreen? }`

---

### Step 1: `packages/shared/src/components/player/SourceSelector.tsx`

```typescript
import React, { useRef, useState } from "react";
import { usePlayerStore } from "../../stores/playerStore";

export function SourceSelector() {
  const setSource = usePlayerStore((s) => s.setSource);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSource({ type: "file", path: file.name });
      const video = document.querySelector("video");
      if (video) video.src = url;
    }
  };

  const handleUrl = () => {
    if (!urlInput.trim()) return;
    setSource({ type: "url", url: urlInput.trim() });
    const video = document.querySelector("video");
    if (video) video.src = urlInput.trim();
    setShowUrlInput(false);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFile}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 text-xs text-ocean-300 hover:text-ocean-100 bg-ocean-800/50 hover:bg-ocean-700/50 px-3 py-1.5 rounded-full transition-colors"
      >
        📁 本地文件
      </button>
      <button
        onClick={() => setShowUrlInput(!showUrlInput)}
        className="flex items-center gap-1.5 text-xs text-ocean-300 hover:text-ocean-100 bg-ocean-800/50 hover:bg-ocean-700/50 px-3 py-1.5 rounded-full transition-colors"
      >
        🌐 网页链接
      </button>
      {showUrlInput && (
        <div className="flex items-center gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="粘贴视频链接..."
            className="bg-ocean-800/50 text-ocean-100 text-xs rounded-full px-3 py-1.5 outline-none border border-ocean-700/50 w-48"
            onKeyDown={(e) => e.key === "Enter" && handleUrl()}
          />
          <button onClick={handleUrl} className="text-xs text-ocean-300 hover:text-ocean-100">
            确认
          </button>
        </div>
      )}
    </div>
  );
}
```

### Step 2: `packages/shared/src/components/player/PlaybackControls.tsx`

```typescript
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
```

### Step 3: `packages/shared/src/components/player/VideoPlayer.tsx`

```typescript
import React, { useRef, useEffect } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import { SourceSelector } from "./SourceSelector";
import { PlaybackControls } from "./PlaybackControls";

interface VideoPlayerProps {
  onFullscreen?: () => void;
}

export function VideoPlayer({ onFullscreen }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isPlaying, currentTime, playbackRate, volume, source, syncStatus,
    setCurrentTime, setDuration, play, pause } = usePlayerStore();

  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    if (isPlaying) v.play().catch(() => {}); else v.pause();
  }, [isPlaying]);

  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    if (Math.abs(v.currentTime - currentTime) > 0.5) v.currentTime = currentTime;
  }, [currentTime]);

  useEffect(() => { if (videoRef.current) videoRef.current.playbackRate = playbackRate; }, [playbackRate]);
  useEffect(() => { if (videoRef.current) videoRef.current.volume = volume; }, [volume]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <SourceSelector />
      <div className="flex-1 bg-black flex items-center justify-center min-h-0 relative">
        {source ? (
          <video ref={videoRef}
            onTimeUpdate={() => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
            onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
            onClick={() => isPlaying ? pause() : play()}
            className="max-w-full max-h-full object-contain" />
        ) : (
          <div className="text-center text-ocean-500">
            <div className="text-4xl mb-3">📺</div>
            <p className="text-sm">选择本地文件或粘贴视频链接开始观影</p>
          </div>
        )}
      </div>
      <PlaybackControls syncStatus={syncStatus} onFullscreen={onFullscreen} />
    </div>
  );
}
```

### Step 4: 更新 `packages/web/src/App.tsx` — playerArea 改为 `<VideoPlayer />`

### Step 5: 更新 shared 导出追加 exports

### Step 6: 验证 `pnpm dev:web` → 可以加载本地视频或 URL
### Step 7: Commit `git add -A && git commit -m "feat: add video player with local/URL playback and controls"`
