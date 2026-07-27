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
