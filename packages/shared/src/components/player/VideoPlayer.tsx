import React, { useRef, useEffect, useState } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import type { SyncState } from "../../lib/sync";
import { useVideoSync } from "../../hooks/useVideoSync";
import { SourceSelector } from "./SourceSelector";
import { PlaybackControls } from "./PlaybackControls";
import { resolveEmbedUrl, isVideoUrl } from "../../lib/embedResolver";

interface VideoPlayerProps {
  onFullscreen?: () => void;
  roomCode: string;
  sendSyncState: (state: SyncState) => void;
  onSyncState: (handler: (state: SyncState) => void) => () => void;
}

export function VideoPlayer({ onFullscreen, roomCode, sendSyncState, onSyncState }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isPlaying, currentTime, playbackRate, volume, source, syncStatus,
    setCurrentTime, setDuration, play, pause } = usePlayerStore();
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useVideoSync(roomCode, sendSyncState, onSyncState);

  // 解析 source.url → 判断是否用 iframe
  useEffect(() => {
    if (source?.type === "url" && source.url && !isVideoUrl(source.url)) {
      const resolved = resolveEmbedUrl(source.url);
      setEmbedUrl(resolved);
    } else {
      setEmbedUrl(null);
    }
  }, [source]);

  // ---- <video> 控制 ----
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
    if (source.type === "file" && source.path) {
      v.src = `file://${source.path}`;
    } else if (source.type === "url" && source.url) {
      v.src = source.url;
    }
  }, [source]);

  const showIframe = !!(embedUrl && source);
  const showVideo = !!source && !showIframe;
  const isElectron = typeof window !== "undefined" && "electronAPI" in window;

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
        {showIframe && (
          <iframe
            ref={iframeRef}
            src={embedUrl!}
            allow="autoplay; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
        {showVideo && (
          <video ref={videoRef}
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
