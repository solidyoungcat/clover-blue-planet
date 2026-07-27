# Task 3.3: 宠物系统 — PetDisplay + PetSettings

**Files:**
- Create: `packages/shared/src/components/pet/PetDisplay.tsx`
- Create: `packages/shared/src/components/pet/PetSettings.tsx`
- Modify: `packages/shared/src/components/chat/ChatPanel.tsx` (insert PetDisplay between messages and input)
- Modify: `packages/shared/src/index.ts` (追加 exports)

**Interfaces:**
- Consumes: Task 1.3 (petStore), Task 2.1 (ChatPanel)
- Produces:
  - `PetDisplay` — props: `{ compact?: boolean }` — 宠物动画 + 互动按钮（compact模式仅48px头像）
  - `PetSettings` — props: `{ onClose: () => void }` — 选择/改名模态框

---

### Step 1: `packages/shared/src/components/pet/PetDisplay.tsx`

```typescript
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
```

### Step 2: `packages/shared/src/components/pet/PetSettings.tsx`

```typescript
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
```

### Step 3: 修改 `ChatPanel.tsx` — 在消息列表和输入框之间插入 `<PetDisplay />`

```typescript
// 在 ChatPanel 的 return 中，在 MessageInput 之前添加:
<PetDisplay />
```

### Step 4: 更新 shared 导出

```typescript
export { PetDisplay } from "./components/pet/PetDisplay";
export { PetSettings } from "./components/pet/PetSettings";
```

### Step 5: Commit `git add -A && git commit -m "feat: add virtual pet system with selection, naming, and interaction"`
