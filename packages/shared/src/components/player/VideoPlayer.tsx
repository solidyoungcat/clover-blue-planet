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
