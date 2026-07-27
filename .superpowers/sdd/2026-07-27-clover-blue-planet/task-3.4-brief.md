# Task 3.4: 操作区整合 + 影院模式

**Files:**
- Create: `packages/shared/src/components/player/PlayerToolbar.tsx`
- Create: `packages/shared/src/components/layout/CinemaMode.tsx`
- Modify: `packages/shared/src/components/player/VideoPlayer.tsx` (add onFullscreen prop)
- Modify: `packages/web/src/App.tsx` (integrate PlayerToolbar + CinemaMode toggle)
- Modify: `packages/shared/src/index.ts` (追加 exports)

**Interfaces:**
- Consumes: Tasks 2.2 (VideoPlayer), 3.3 (PetSettings)
- Produces:
  - `PlayerToolbar` — 整合 SourceSelector + 宠物设置入口
  - `CinemaMode` — 全屏影院：全屏视频 + 底部控制条(3s自动隐藏) + 单行聊天条 + 紧凑宠物(48px)

---

### Step 1: `packages/shared/src/components/player/PlayerToolbar.tsx`

```typescript
import React, { useState } from "react";
import { SourceSelector } from "./SourceSelector";
import { PetSettings } from "../pet/PetSettings";

export function PlayerToolbar() {
  const [showPetSettings, setShowPetSettings] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-ocean-900/60 border-t border-ocean-700/30">
        <SourceSelector />
        <div className="w-px h-4 bg-ocean-700/50" />
        <button
          onClick={() => setShowPetSettings(true)}
          className="flex items-center gap-1.5 text-xs text-ocean-300 hover:text-ocean-100 bg-ocean-800/50 hover:bg-ocean-700/50 px-3 py-1.5 rounded-full transition-colors"
        >
          🐱 宠物⚙️
        </button>
      </div>
      {showPetSettings && <PetSettings onClose={() => setShowPetSettings(false)} />}
    </>
  );
}
```

### Step 2: `packages/shared/src/components/layout/CinemaMode.tsx`

```typescript
import React, { useState, useEffect } from "react";
import { VideoPlayer } from "../player/VideoPlayer";
import { useChatStore, type Message } from "../../stores/chatStore";
import { MessageInput } from "../chat/MessageInput";
import { PetDisplay } from "../pet/PetDisplay";

interface CinemaModeProps {
  onExit: () => void;
  sendChatMessage: (msg: Message) => void;
  roomCode: string;
}

export function CinemaMode({ onExit, sendChatMessage, roomCode }: CinemaModeProps) {
  const [showControls, setShowControls] = useState(true);
  const messages = useChatStore((s) => s.messages);
  const lastMessage = messages[messages.length - 1];
  const addMessage = useChatStore((s) => s.addMessage);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [showControls]);

  useEffect(() => {
    const handleMouseMove = () => setShowControls(true);
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onExit(); };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleSend = (text: string, type: "text" | "emoji") => {
    const msg: Message = { id: String(Date.now()), sender: "me", text, type, timestamp: Date.now() };
    addMessage(msg);
    sendChatMessage(msg);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 min-h-0">
        <VideoPlayer roomCode={roomCode} />
      </div>
      {showControls && (
        <div className="absolute bottom-[52px] left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <button onClick={onExit} className="text-white/80 hover:text-white text-sm">⛶ 退出影院</button>
        </div>
      )}
      <div className="flex items-center gap-3 px-4 py-2" style={{ background: "rgba(8,47,73,0.7)", backdropFilter: "blur(8px)" }}>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {lastMessage && (
            <span className="text-ocean-200 text-sm truncate">
              💬 {lastMessage.sender === "me" ? "我" : "TA"}: {lastMessage.text}
            </span>
          )}
          <MessageInput onSend={handleSend} />
        </div>
        <PetDisplay compact />
      </div>
    </div>
  );
}
```

### Step 3: 更新 VideoPlayer — 移除 onFullscreen prop，改为由外部控制

VideoPlayer 已支持 `onFullscreen` prop。在 PlaybackControls 末尾添加全屏按钮即可（已在 Task 2.2 完成）。

### Step 4: 更新 `packages/web/src/App.tsx`

```typescript
import React, { useState } from "react";
import { AppLayout, VideoPlayer, ChatPanel, PlayerToolbar, CinemaMode, RoomConnector, useRoomStore, useSocket } from "@clover/shared";

export function App() {
  const { roomCode, partnerOnline } = useRoomStore();
  const { sendChatMessage } = useSocket(roomCode);
  const [cinemaMode, setCinemaMode] = useState(false);

  if (cinemaMode) {
    return <CinemaMode onExit={() => setCinemaMode(false)} sendChatMessage={sendChatMessage} roomCode={roomCode} />;
  }

  return (
    <AppLayout
      roomCode={roomCode}
      partnerOnline={partnerOnline}
      playerArea={
        <div className="flex flex-col flex-1 min-h-0">
          <RoomConnector />
          <VideoPlayer roomCode={roomCode} onFullscreen={() => setCinemaMode(true)} />
          <PlayerToolbar />
        </div>
      }
      chatArea={<ChatPanel sendChatMessage={sendChatMessage} />}
      onCopyRoomCode={() => navigator.clipboard.writeText(roomCode)}
      onOpenTheme={() => {}}
      onOpenSettings={() => {}}
    />
  );
}
```

### Step 5: 更新 shared 导出

```typescript
export { PlayerToolbar } from "./components/player/PlayerToolbar";
export { CinemaMode } from "./components/layout/CinemaMode";
```

### Step 6: Commit `git add -A && git commit -m "feat: add PlayerToolbar, CinemaMode with compact chat and pet"`
