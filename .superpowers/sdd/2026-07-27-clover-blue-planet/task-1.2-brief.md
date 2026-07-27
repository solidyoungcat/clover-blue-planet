# Task 1.2: 共享布局组件 — 设计令牌 + AppLayout + TopBar + ResizableSplit

**Files:**
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/lib/constants.ts`
- Create: `packages/shared/src/components/layout/TopBar.tsx`
- Create: `packages/shared/src/components/layout/AppLayout.tsx`
- Create: `packages/shared/src/components/layout/ResizableSplit.tsx`
- Modify: `packages/web/src/main.tsx`
- Modify: `packages/web/src/App.tsx`

**Interfaces:**
- Consumes: Task 1.1 (monorepo ready)
- Produces:
  - `AppLayout` — props: `{ roomCode, partnerOnline, playerArea, chatArea, onCopyRoomCode, onOpenTheme, onOpenSettings }`
  - `TopBar` — props: `{ roomCode, partnerOnline, onCopyRoomCode, onOpenTheme, onOpenSettings }`
  - `ResizableSplit` — props: `{ left, right, defaultRatio? }`
  - Design token constants from `constants.ts`

**Global Constraints:**
- Tab 标签全部中文
- 海边蓝调 Tailwind colors：ocean-50..ocean-950, sand
- 布局高度 48px TopBar，默认 70/30 分割

---

### Step 1: 创建设计令牌常量 `packages/shared/src/lib/constants.ts`

```typescript
export const COLORS = {
  bg: { app: "#082F49", surface: "#0C4A6E", card: "#0E3A54" },
  text: { primary: "#E0F2FE", muted: "#7BA8C8" },
  primary: "#38BDF8",
  accent: "#F59E0B",
  border: "#1E5A7A",
} as const;

export const LAYOUT = {
  topBarHeight: 48,
  defaultSplitRatio: 70,
  minPanelWidth: 280,
} as const;
```

### Step 2: 创建 `packages/shared/src/components/layout/TopBar.tsx`

```typescript
import React from "react";

interface TopBarProps {
  roomCode: string;
  partnerOnline: boolean;
  onCopyRoomCode: () => void;
  onOpenTheme: () => void;
  onOpenSettings: () => void;
}

export function TopBar({
  roomCode,
  partnerOnline,
  onCopyRoomCode,
  onOpenTheme,
  onOpenSettings,
}: TopBarProps) {
  return (
    <div
      className="flex items-center justify-between px-4 shrink-0 border-b border-ocean-700/50"
      style={{ height: 48, background: "rgba(12,74,110,0.6)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">🍀</span>
        <span className="font-heading text-ocean-100 text-base tracking-wide">
          四叶草蓝星球
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-ocean-200">
          <span>🔗 {roomCode}</span>
          <button
            onClick={onCopyRoomCode}
            className="text-ocean-400 hover:text-ocean-200 transition-colors text-xs"
          >
            📋复制
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={partnerOnline ? "text-green-400" : "text-ocean-500"}>●</span>
          <span className="text-ocean-300">TA{partnerOnline ? "在线" : "离线"}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onOpenTheme} className="p-1.5 text-ocean-300 hover:text-ocean-100 transition-colors">
          🎨
        </button>
        <button onClick={onOpenSettings} className="p-1.5 text-ocean-300 hover:text-ocean-100 transition-colors">
          ⚙️
        </button>
      </div>
    </div>
  );
}
```

### Step 3: 创建 `packages/shared/src/components/layout/ResizableSplit.tsx`

```typescript
import React, { useState, useCallback, useRef, type ReactNode } from "react";

interface ResizableSplitProps {
  left: ReactNode;
  right: ReactNode;
  defaultRatio?: number;
}

export function ResizableSplit({ left, right, defaultRatio = 70 }: ResizableSplitProps) {
  const [ratio, setRatio] = useState(defaultRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const onMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      if (newRatio > 30 && newRatio < 85) setRatio(newRatio);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-1 min-h-0 overflow-hidden">
      <div style={{ width: `${ratio}%` }} className="min-h-0 flex flex-col">
        {left}
      </div>
      <div
        onMouseDown={onMouseDown}
        className="w-1.5 bg-ocean-800 hover:bg-ocean-400 cursor-col-resize shrink-0 transition-colors"
      />
      <div style={{ width: `${100 - ratio}%` }} className="min-h-0 flex flex-col">
        {right}
      </div>
    </div>
  );
}
```

### Step 4: 创建 `packages/shared/src/components/layout/AppLayout.tsx`

```typescript
import React, { type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { ResizableSplit } from "./ResizableSplit";

interface AppLayoutProps {
  roomCode: string;
  partnerOnline: boolean;
  playerArea: ReactNode;
  chatArea: ReactNode;
  onCopyRoomCode: () => void;
  onOpenTheme: () => void;
  onOpenSettings: () => void;
}

export function AppLayout({
  roomCode,
  partnerOnline,
  playerArea,
  chatArea,
  onCopyRoomCode,
  onOpenTheme,
  onOpenSettings,
}: AppLayoutProps) {
  return (
    <div className="h-screen w-screen flex flex-col bg-ocean-950 overflow-hidden">
      <TopBar
        roomCode={roomCode}
        partnerOnline={partnerOnline}
        onCopyRoomCode={onCopyRoomCode}
        onOpenTheme={onOpenTheme}
        onOpenSettings={onOpenSettings}
      />
      <ResizableSplit left={playerArea} right={chatArea} />
    </div>
  );
}
```

### Step 5: 创建 shared 入口 `packages/shared/src/index.ts`

```typescript
export { AppLayout } from "./components/layout/AppLayout";
export { TopBar } from "./components/layout/TopBar";
export { ResizableSplit } from "./components/layout/ResizableSplit";
export { COLORS, LAYOUT } from "./lib/constants";
```

### Step 6: 创建 Web 入口文件

**`packages/web/src/main.tsx`:**
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**`packages/web/src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**`packages/web/src/App.tsx`:**
```typescript
import React from "react";
import { AppLayout } from "@clover/shared";

export function App() {
  return (
    <AppLayout
      roomCode="------"
      partnerOnline={false}
      playerArea={
        <div className="flex-1 flex items-center justify-center text-ocean-400 text-lg">
          📺 等待开始观影...
        </div>
      }
      chatArea={
        <div className="flex-1 flex items-center justify-center text-ocean-400 text-lg">
          💬 聊天区域
        </div>
      }
      onCopyRoomCode={() => {}}
      onOpenTheme={() => {}}
      onOpenSettings={() => {}}
    />
  );
}
```

### Step 7: 验证 `pnpm dev:web` — 浏览器打开 localhost:3000
### Step 8: Commit `git add -A && git commit -m "feat: add AppLayout, TopBar, ResizableSplit with ocean design tokens"`
