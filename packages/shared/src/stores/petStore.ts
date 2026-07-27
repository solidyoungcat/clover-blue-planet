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
