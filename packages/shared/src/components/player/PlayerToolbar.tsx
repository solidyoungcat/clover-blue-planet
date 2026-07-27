import React, { useState } from "react";
import { SourceSelector } from "./SourceSelector";
import { PetSettings } from "../pet/PetSettings";

export function PlayerToolbar() {
  const [showPetSettings, setShowPetSettings] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-ocean-900/60 border-t border-ocean-700/30">
        <SourceSelector />
        <div className="w-px h-4 bg-ocean-700/50" />
        <button
          onClick={() => setShowPetSettings(true)}
          className="flex items-center gap-1.5 text-xs text-ocean-300 hover:text-ocean-100 bg-ocean-800/50 hover:bg-ocean-700/50 px-3 py-1.5 rounded-full transition-colors"
        >
          🐱 宠物⚙️
        </button>
      </div>
      {showPetSettings && <PetSettings onClose={() => setShowPetSettings(false)} />}
    </>
  );
}
