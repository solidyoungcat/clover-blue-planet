import React, { useState } from "react";
import { usePetStore } from "../../stores/petStore";

type PetType = "cat" | "dog" | "rabbit" | "hamster";

const PET_OPTIONS: { type: PetType; emoji: string; label: string }[] = [
  { type: "cat", emoji: "🐱", label: "小猫咪" },
  { type: "dog", emoji: "🐶", label: "小狗狗" },
  { type: "rabbit", emoji: "🐰", label: "小兔子" },
  { type: "hamster", emoji: "🐹", label: "小仓鼠" },
];

interface PetSettingsProps {
  onClose: () => void;
}

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-ocean-900 border border-ocean-700 rounded-2xl p-6 w-80">
        <h3 className="text-ocean-100 text-lg font-medium mb-4">🐱 宠物设置</h3>
        {!petType ? (
          <>
            <p className="text-ocean-400 text-sm mb-3">选择你的小宠物：</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PET_OPTIONS.map((p) => (
                <button key={p.type} onClick={() => handleSelect(p.type)}
                  className="bg-ocean-800/50 hover:bg-ocean-700/50 rounded-xl p-3 text-center transition-colors">
                  <div className="text-3xl mb-1">{p.emoji}</div>
                  <div className="text-ocean-300 text-xs">{p.label}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <span className="text-5xl">{PET_OPTIONS.find((p) => p.type === petType)?.emoji}</span>
            </div>
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)}
              placeholder="给它起个名字..."
              className="w-full bg-ocean-800/50 text-ocean-100 rounded-lg px-3 py-2 outline-none border border-ocean-700/50 mb-4" />
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 bg-ocean-600 hover:bg-ocean-500 text-white rounded-lg py-2 text-sm transition-colors">保存</button>
              <button onClick={onClose} className="flex-1 bg-ocean-800/50 text-ocean-300 rounded-lg py-2 text-sm hover:bg-ocean-700/50 transition-colors">取消</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
