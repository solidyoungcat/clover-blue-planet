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
  generateRoomCode: () => {
    const code = randomCode();
    set({ roomCode: code, partnerOnline: false });
    return code;
  },
}));
