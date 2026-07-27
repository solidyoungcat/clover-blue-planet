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
