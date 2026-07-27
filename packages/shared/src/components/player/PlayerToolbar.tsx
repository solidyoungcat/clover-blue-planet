import React, { useState } from "react";
import { SourceSelector } from "./SourceSelector";
import { PetSettings } from "../pet/PetSettings";
import { usePetStore } from "../../stores/petStore";

export function PlayerToolbar() {
  const [showPetSettings, setShowPetSettings] = useState(false);
  const isActive = usePetStore((s) => s.isActive);

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-ocean-950/80 to-ocean-900/40 border-t border-ocean-700/20">
        <SourceSelector />

        <div className="flex-1" />

        <div className="w-px h-5 bg-ocean-700/20" />

        <button
          onClick={() => setShowPetSettings(true)}
          className={`btn-ocean btn-sm ${isActive ? "border-ocean-400/30" : ""}`}
        >
          🐱 宠物
        </button>
      </div>
      {showPetSettings && <PetSettings onClose={() => setShowPetSettings(false)} />}
    </>
  );
}
