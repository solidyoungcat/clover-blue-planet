import React, { useState } from "react";
import { usePetStore } from "../../stores/petStore";

type PetType = "cat" | "dog" | "rabbit" | "hamster";

const PET_OPTIONS: { type: PetType; emoji: string; label: string }[] = [
  { type: "cat", emoji: "🐱", label: "小猫咪" },
  { type: "dog", emoji: "🐶", label: "小狗狗" },
  { type: "rabbit", emoji: "🐰", label: "小兔子" },
  { type: "hamster", emoji: "🐹", label: "小仓鼠" },
];

interface PetSettingsProps { onClose: () => void; }

export function PetSettings({ onClose }: PetSettingsProps) {
  const { petName, petType, setName, setType, setActive } = usePetStore();
  const [nameInput, setNameInput] = useState(petName);

  const handleSelect = (type: PetType) => {
    setType(type);
    setName(nameInput || PET_OPTIONS.find((p) => p.type === type)!.label);
    setActive(true);
  };

  const handleSave = () => {
    if (nameInput.trim()) setName(nameInput.trim());
    setActive(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-scale-in">
      <div className="card-ocean p-6 w-80 shadow-glow-lg">
        <h3 className="text-ocean-100 text-base font-heading tracking-wide mb-4">🐱 宠物设置</h3>

        {!petType ? (
          <>
            <p className="text-ocean-400 text-xs mb-4">选择一只你的小宠物：</p>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {PET_OPTIONS.map((p) => (
                <button key={p.type} onClick={() => handleSelect(p.type)}
                  className="card-ocean p-3.5 text-center hover:border-ocean-400/40 hover:shadow-glow-sm transition-all">
                  <div className="text-3xl mb-1.5">{p.emoji}</div>
                  <div className="text-ocean-300 text-xs tracking-wide">{p.label}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <span className="text-5xl animate-float inline-block">
                {PET_OPTIONS.find((p) => p.type === petType)?.emoji}
              </span>
            </div>
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)}
              placeholder="给它起个名字..."
              className="w-full bg-ocean-950/60 text-ocean-100 rounded-xl px-4 py-2.5 outline-none border border-ocean-600/30 focus:border-ocean-400/60 focus:shadow-glow-sm transition-all placeholder:text-ocean-600 mb-4 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">保存</button>
              <button onClick={onClose} className="btn-ocean flex-1 justify-center">取消</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
