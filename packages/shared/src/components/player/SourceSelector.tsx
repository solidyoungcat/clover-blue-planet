import React, { useRef, useState } from "react";
import { usePlayerStore } from "../../stores/playerStore";

export function SourceSelector() {
  const setSource = usePlayerStore((s) => s.setSource);
  const source = usePlayerStore((s) => s.source);
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
    setShowUrlInput(false);
    setUrlInput("");
  };

  return (
    <div className="flex items-center gap-2">
      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />

      <button onClick={() => fileInputRef.current?.click()} className="btn-ocean btn-sm">
        📁 本地文件
      </button>

      {!showUrlInput ? (
        <button onClick={() => setShowUrlInput(true)} className="btn-ocean btn-sm">
          🌐 网页链接
        </button>
      ) : (
        <div className="flex items-center gap-1.5 animate-scale-in">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="粘贴视频直链 / B站链接..."
            className="bg-ocean-950/60 text-ocean-100 text-xs rounded-lg px-3 py-1.5 w-44 outline-none border border-ocean-600/30 focus:border-ocean-400/60 focus:shadow-glow-sm transition-all placeholder:text-ocean-600"
            onKeyDown={(e) => e.key === "Enter" && handleUrl()}
            autoFocus
          />
          <button onClick={handleUrl} className="btn-primary btn-sm">播放</button>
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
