# Task 1.3: Zustand Store — 房间 & 聊天 & 播放器 & 宠物 & 主题 状态

**Files:**
- Create: `packages/shared/src/stores/roomStore.ts`
- Create: `packages/shared/src/stores/chatStore.ts`
- Create: `packages/shared/src/stores/playerStore.ts`
- Create: `packages/shared/src/stores/petStore.ts`
- Create: `packages/shared/src/stores/themeStore.ts`
- Modify: `packages/shared/src/index.ts` (append exports)

**Interfaces:**
- Consumes: Task 1.1 (monorepo), 1.2 (shared entry point)
- Produces:
  - `useRoomStore` — `{ roomCode, partnerOnline, isHost, setRoomCode, setPartnerOnline, generateRoomCode }`
  - `useChatStore` — `{ messages: Message[], sendMessage, addMessage }` where `Message = { id, sender, text, type, timestamp }`
  - `usePlayerStore` — `{ isPlaying, currentTime, duration, source, syncStatus, play, pause, seek, setDuration, setCurrentTime, setPlaybackRate, setVolume, setSource, setSyncStatus }`
  - `usePetStore` — `{ petName, petType, isActive, hunger, happiness, interactCount, setName, setType, setActive, feed, playWith }`
  - `useThemeStore` — `{ preset, customPrimary, setPreset, setCustomPrimary }`

**Global Constraints:**
- zustand ^4.5.0
- PetType = "cat" | "dog" | "rabbit" | "hamster" | null
- ThemePreset = "ocean" | "sunset" | "forest" | "starry"

---

### Step 1: `packages/shared/src/stores/roomStore.ts`

```typescript
import { create } from "zustand";

interface RoomState {
  roomCode: string;
  partnerOnline: boolean;
  isHost: boolean;
  setRoomCode: (code: string) => void;
  setPartnerOnline: (online: boolean) => void;
  setIsHost: (host: boolean) => void;
  generateRoomCode: () => string;
}

function randomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const useRoomStore = create<RoomState>((set) => ({
  roomCode: randomCode(),
  partnerOnline: false,
  isHost: true,
  setRoomCode: (code) => set({ roomCode: code }),
  setPartnerOnline: (online) => set({ partnerOnline: online }),
  setIsHost: (host) => set({ isHost: host }),
  generateRoomCode: () => set({ roomCode: randomCode(), partnerOnline: false }),
}));
```

### Step 2: `packages/shared/src/stores/chatStore.ts`

```typescript
import { create } from "zustand";

export interface Message {
  id: string;
  sender: "me" | "partner";
  text: string;
  type: "text" | "emoji" | "voice";
  voiceUrl?: string;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  sendMessage: (text: string, type?: "text" | "emoji" | "voice", voiceUrl?: string) => void;
  addMessage: (msg: Message) => void;
}

let nextId = 1;

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  sendMessage: (text, type = "text", voiceUrl) => {
    const msg: Message = {
      id: String(nextId++),
      sender: "me",
      text,
      type,
      voiceUrl,
      timestamp: Date.now(),
    };
    set((s) => ({ messages: [...s.messages, msg] }));
  },
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
}));
```

### Step 3: `packages/shared/src/stores/playerStore.ts`

```typescript
import { create } from "zustand";

type VideoSource = { type: "file"; path?: string } | { type: "url"; url?: string } | null;

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  source: VideoSource;
  syncStatus: "connected" | "buffering" | "disconnected";
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setDuration: (d: number) => void;
  setCurrentTime: (t: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (v: number) => void;
  setSource: (source: VideoSource) => void;
  setSyncStatus: (status: "connected" | "buffering" | "disconnected") => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  volume: 1,
  source: null,
  syncStatus: "disconnected",
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  seek: (time) => set({ currentTime: time }),
  setDuration: (d) => set({ duration: d }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setVolume: (v) => set({ volume: v }),
  setSource: (source) => set({ source }),
  setSyncStatus: (status) => set({ syncStatus: status }),
}));
```

### Step 4: `packages/shared/src/stores/petStore.ts`

```typescript
import { create } from "zustand";

type PetType = "cat" | "dog" | "rabbit" | "hamster" | null;

interface PetState {
  petName: string;
  petType: PetType;
  isActive: boolean;
  hunger: number;
  happiness: number;
  animations: string[];
  interactCount: number;
  setName: (name: string) => void;
  setType: (type: PetType) => void;
  setActive: (active: boolean) => void;
  feed: () => void;
  playWith: () => void;
}

export const usePetStore = create<PetState>((set) => ({
  petName: "",
  petType: null,
  isActive: false,
  hunger: 100,
  happiness: 100,
  animations: ["idle"],
  interactCount: 0,
  setName: (name) => set({ petName: name }),
  setType: (type) => set({ petType: type }),
  setActive: (active) => set({ isActive: active }),
  feed: () =>
    set((s) => ({
      hunger: Math.min(100, s.hunger + 20),
      interactCount: s.interactCount + 1,
    })),
  playWith: () =>
    set((s) => ({
      happiness: Math.min(100, s.happiness + 15),
      interactCount: s.interactCount + 1,
    })),
}));
```

### Step 5: `packages/shared/src/stores/themeStore.ts`

```typescript
import { create } from "zustand";

type ThemePreset = "ocean" | "sunset" | "forest" | "starry";

interface ThemeState {
  preset: ThemePreset;
  customPrimary: string | null;
  setPreset: (preset: ThemePreset) => void;
  setCustomPrimary: (color: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preset: "ocean",
  customPrimary: null,
  setPreset: (preset) => set({ preset, customPrimary: null }),
  setCustomPrimary: (color) => set({ customPrimary: color }),
}));
```

### Step 6: 更新 `packages/shared/src/index.ts` 末尾追加:

```typescript
export { useRoomStore } from "./stores/roomStore";
export { useChatStore } from "./stores/chatStore";
export { usePlayerStore } from "./stores/playerStore";
export { usePetStore } from "./stores/petStore";
export { useThemeStore } from "./stores/themeStore";
export type { Message } from "./stores/chatStore";
```

### Step 7: 验证 `pnpm --filter @clover/shared typecheck`
### Step 8: Commit
