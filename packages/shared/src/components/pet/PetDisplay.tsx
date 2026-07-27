import React from "react";
import { usePetStore } from "../../stores/petStore";

const PET_EMOJIS: Record<string, string> = { cat: "🐱", dog: "🐶", rabbit: "🐰", hamster: "🐹" };

interface PetDisplayProps {
  compact?: boolean;
}

export function PetDisplay({ compact = false }: PetDisplayProps) {
  const { petName, petType, isActive, hunger, happiness, feed, playWith } = usePetStore();

  if (!isActive || !petType) {
    if (compact) return null;
    return (
      <div className="text-center text-ocean-500 text-xs py-4">
        还未启动宠物，在操作区点击 🐱 开始
      </div>
    );
  }

  const emoji = PET_EMOJIS[petType] || "🐱";

  if (compact) {
    return (
      <button className="w-12 h-12 flex items-center justify-center text-2xl hover:scale-110 transition-transform">
        {emoji}
      </button>
    );
  }

  return (
    <div className="px-3 py-3 border-t border-ocean-700/50">
      <div className="bg-ocean-800/30 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">{emoji}</span>
          <div>
            <div className="text-ocean-100 text-sm font-medium">{petName}</div>
            <div className="flex gap-3 text-xs text-ocean-400 mt-0.5">
              <span>🍖 {hunger}</span>
              <span>😊 {happiness}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={feed} className="flex-1 text-xs text-ocean-300 hover:text-ocean-100 bg-ocean-700/30 hover:bg-ocean-600/30 rounded-lg py-1.5 transition-colors">
            ❤️ 喂食
          </button>
          <button onClick={playWith} className="flex-1 text-xs text-ocean-300 hover:text-ocean-100 bg-ocean-700/30 hover:bg-ocean-600/30 rounded-lg py-1.5 transition-colors">
            🎾 玩耍
          </button>
        </div>
      </div>
    </div>
  );
}
