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
