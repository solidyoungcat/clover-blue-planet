import React, { useRef, useState } from "react";
import { usePlayerStore } from "../../stores/playerStore";

const VIDEO_EXTS = /\.(mp4|webm|mkv|avi|mov|flv|wmv)($|\?)/i;
const isVideoUrl = (url: string) => VIDEO_EXTS.test(url);
const isElectron = typeof window !== "undefined" && "electronAPI" in window;

async function resolveUrl(raw: string): Promise<string | null> {
  const url = raw.trim();
  if (!url.startsWith("http")) return null;
  if (isVideoUrl(url)) return url;

  // Electron 桌面端 — IPC 调用主进程 yt-dlp
  if (isElectron) {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.resolveVideo) {
      const result = await electronAPI.resolveVideo(url);
      if (result?.url) return result.url;
    }
    return null;
  }

  // Web 端 — HTTP API
  try {
    const res = await fetch(`/api/v1/resolve?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}

export function SourceSelector() {
  const setSource = usePlayerStore((s) => s.setSource);
  const source = usePlayerStore((s) => s.source);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [resolving, setResolving] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setSource({ type: "file", path: file.name });
      const video = document.querySelector("video");
      if (video) video.src = videoUrl;
    }
  };

  const handleUrl = async () => {
    if (!urlInput.trim()) return;
    setResolving(true);

    // Electron 桌面端 — 优先用 preload 直接路径（绕过 Vite 热更新缓存）
    if (isElectron) {
      const api = (window as any).electronAPI;
      if (api?.resolveAndPlay) {
        const result = await api.resolveAndPlay(urlInput.trim());
        setResolving(false);
        if (result?.success) {
          setSource({ type: "url", url: result.url });
        } else {
          setSource({ type: "url", url: urlInput.trim() });
        }
        setShowUrlInput(false);
        setUrlInput("");
        return;
      }
    }

    // Web 端 / Electron 兜底 — 通过 resolveUrl
    const streamUrl = await resolveUrl(urlInput);
    setResolving(false);
    if (streamUrl) {
      setSource({ type: "url", url: streamUrl });
    } else {
      setSource({ type: "url", url: urlInput.trim() });
    }
    setShowUrlInput(false);
    setUrlInput("");
  };

  return (
    <div className="flex items-center gap-2">
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />
      <button onClick={() => fileInputRef.current?.click()} className="btn-ocean btn-sm">📁 本地文件</button>
      {!showUrlInput ? (
        <button onClick={() => setShowUrlInput(true)} className="btn-ocean btn-sm">🌐 网页链接</button>
      ) : (
        <div className="flex items-center gap-1.5 animate-scale-in">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="粘贴 B站/YouTube/视频直链..."
            className="bg-ocean-950/60 text-ocean-100 text-xs rounded-lg px-3 py-1.5 w-52 outline-none border border-ocean-600/30 focus:border-ocean-400/60 focus:shadow-glow-sm transition-all placeholder:text-ocean-600"
            onKeyDown={(e) => e.key === "Enter" && handleUrl()}
            autoFocus
            disabled={resolving}
          />
          <button onClick={handleUrl} className="btn-primary btn-sm" disabled={resolving}>
            {resolving ? "解析中..." : "播放"}
          </button>
          <button onClick={() => { setShowUrlInput(false); setUrlInput(""); }} className="btn-ocean btn-sm text-ocean-500">取消</button>
        </div>
      )}
      {source && (
        <span className="text-ocean-500 text-[11px] truncate max-w-[160px]">
          {source.type === "file" ? `📄 ${source.path}` : `🔗 ${(source as any).url?.slice(0, 30)}...`}
        </span>
      )}
    </div>
  );
}
