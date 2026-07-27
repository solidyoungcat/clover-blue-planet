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
      <div className="text-center text-ocean-500 text-xs py-6 px-4">
        <div className="text-3xl mb-2 opacity-30">🐱</div>
        <p>还未启动宠物</p>
        <p className="text-ocean-600 text-[11px] mt-1">在下方操作区点击 🐱 开始</p>
      </div>
    );
  }

  const emoji = PET_EMOJIS[petType] || "🐱";

  if (compact) {
    return (
      <button className="w-10 h-10 flex items-center justify-center text-xl rounded-xl border border-ocean-700/30 bg-ocean-900/40 hover:border-ocean-500/40 hover:shadow-glow-sm transition-all hover:scale-110">
        {emoji}
      </button>
    );
  }

  return (
    <div className="px-3 py-3 border-t border-ocean-700/20">
      <div className="card-ocean p-3">
        {/* 宠物信息 */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl animate-float select-none">{emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="text-ocean-100 text-sm font-medium tracking-wide">
              {petName}
            </div>
            <div className="flex gap-3 text-[11px] text-ocean-400 mt-1">
              <span className="flex items-center gap-1">
                <span className="text-xs">🍖</span> {hunger}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-xs">😊</span> {happiness}
              </span>
            </div>
          </div>
        </div>

        {/* 属性条 */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-ocean-500 w-6">饱腹</span>
            <div className="flex-1 h-1.5 bg-ocean-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${hunger}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-ocean-500 w-6">开心</span>
            <div className="flex-1 h-1.5 bg-ocean-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500" style={{ width: `${happiness}%` }} />
            </div>
          </div>
        </div>

        {/* 互动按钮 */}
        <div className="flex gap-2">
          <button onClick={feed} className="btn-ocean btn-sm flex-1 justify-center">
            ❤️ 喂食
          </button>
          <button onClick={playWith} className="btn-ocean btn-sm flex-1 justify-center">
            🎾 玩耍
          </button>
        </div>
      </div>
    </div>
  );
}
