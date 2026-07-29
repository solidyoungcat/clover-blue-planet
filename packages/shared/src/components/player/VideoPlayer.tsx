import React, { useRef, useEffect } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import type { SyncState } from "../../lib/sync";
import { useVideoSync } from "../../hooks/useVideoSync";
import { SourceSelector } from "./SourceSelector";
import { PlaybackControls } from "./PlaybackControls";

interface VideoPlayerProps {
  onFullscreen?: () => void;
  roomCode: string;
  sendSyncState: (state: SyncState) => void;
  onSyncState: (handler: (state: SyncState) => void) => () => void;
}

const SERVER = (typeof import.meta !== "undefined") ? ((import.meta as any).env?.VITE_SERVER_URL || "http://localhost:3001") : "";

export function VideoPlayer({ onFullscreen, roomCode, sendSyncState, onSyncState }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const proxyRetryRef = useRef(false);
  const { isPlaying, currentTime, playbackRate, volume, source, syncStatus,
    setCurrentTime, setDuration, play, pause } = usePlayerStore();

  useVideoSync(roomCode, sendSyncState, onSyncState);

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

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !source) return;
    proxyRetryRef.current = false;
    if (source.type === "file" && source.path) {
      v.src = `file://${source.path}`;
    } else if (source.type === "url" && source.url) {
      v.src = source.url;
      v.load();
      v.play().catch(() => {});
    }
  }, [source]);

  // 直连失败 → 走后端流代理（带 Referer）
  const handleError = () => {
    const v = videoRef.current;
    if (!v || !source || source.type !== "url" || proxyRetryRef.current) return;
    proxyRetryRef.current = true;
    const proxyUrl = `${SERVER}/api/v1/stream?url=${encodeURIComponent(source.url!)}`;
    v.src = proxyUrl;
    v.load();
    v.play().catch(() => {});
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <SourceSelector />
      <div className="flex-1 bg-black flex items-center justify-center min-h-0 relative">
        {!source && (
          <div className="text-center text-ocean-500 select-none">
            <div className="text-5xl mb-4 opacity-40">📺</div>
            <p className="text-sm tracking-wide">选择本地文件或粘贴链接</p>
            <p className="text-ocean-600 text-xs mt-1">
              支持 mp4 直链 / B站 / YouTube
            </p>
          </div>
        )}
        {source && (
          <video ref={videoRef}
            controls
            crossOrigin="anonymous"
            onError={handleError}
            onTimeUpdate={() => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
            onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
            onClick={() => isPlaying ? pause() : play()}
            className="max-w-full max-h-full object-contain" />
        )}
      </div>
      <PlaybackControls syncStatus={syncStatus} onFullscreen={onFullscreen} />
    </div>
  );
}
