import React, { useState } from "react";
import { useRoomStore } from "../../stores/roomStore";

interface RoomConnectorProps {
  createRoom: (code: string, password?: string) => void;
  joinRoom: (code: string, password?: string) => void;
  checkRoom: (code: string, cb: (r: { exists: boolean; hasPassword: boolean; userCount: number }) => void) => void;
}

export function RoomConnector({ createRoom, joinRoom, checkRoom }: RoomConnectorProps) {
  const { roomCode, partnerOnline, generateRoomCode } = useRoomStore();

  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [password, setPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [joinStep, setJoinStep] = useState<"code" | "password">("code");

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
  };

  const handleCreate = () => {
    createRoom(roomCode, password || undefined);
    setMode("idle");
    setPassword("");
  };

  const handleJoinCheck = () => {
    if (joinCode.length !== 6) return;
    checkRoom(joinCode, (result) => {
      if (!result.exists) { alert("房间不存在"); return; }
      if (result.hasPassword) {
        setJoinStep("password");
      } else {
        joinRoom(joinCode);
        setJoinCode("");
        setMode("idle");
      }
    });
  };

  const handleJoinWithPassword = () => {
    joinRoom(joinCode, joinPassword);
    setJoinCode("");
    setJoinPassword("");
    setJoinStep("code");
    setMode("idle");
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-ocean-900/60 text-sm flex-wrap">
      <span className="text-ocean-300 shrink-0">房间码:</span>
      <code className="text-ocean-100 font-mono text-lg tracking-wider">{roomCode}</code>
      <button onClick={copyRoomCode} className="text-ocean-400 hover:text-ocean-200 transition-colors">📋复制</button>
      <button onClick={generateRoomCode} className="text-ocean-500 hover:text-ocean-300 transition-colors text-xs">换一个</button>
      <div className="w-px h-4 bg-ocean-700/50 mx-1" />

      {mode === "idle" && (
        <>
          <button onClick={() => setMode("create")} className="text-xs text-ocean-300 hover:text-ocean-100 bg-ocean-800/50 hover:bg-ocean-700/50 px-2 py-1 rounded transition-colors">🔒创建</button>
          <button onClick={() => { setMode("join"); setJoinStep("code"); }} className="text-xs text-ocean-300 hover:text-ocean-100 bg-ocean-800/50 hover:bg-ocean-700/50 px-2 py-1 rounded transition-colors">加入</button>
        </>
      )}

      {mode === "create" && (
        <div className="flex items-center gap-2">
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="设置密码(可选)" className="bg-ocean-800/50 text-ocean-100 text-xs rounded px-2 py-1 w-28 outline-none border border-ocean-700/50" />
          <button onClick={handleCreate} className="text-xs text-green-400 hover:text-green-300">确认</button>
          <button onClick={() => { setMode("idle"); setPassword(""); }} className="text-xs text-ocean-500 hover:text-ocean-300">取消</button>
        </div>
      )}

      {mode === "join" && (
        <div className="flex items-center gap-2">
          {joinStep === "code" ? (
            <>
              <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))} placeholder="输入房间码" maxLength={6} className="bg-ocean-800/50 text-ocean-100 text-xs rounded px-2 py-1 w-24 font-mono outline-none border border-ocean-700/50" />
              <button onClick={handleJoinCheck} disabled={joinCode.length !== 6} className="text-xs text-green-400 hover:text-green-300 disabled:text-ocean-700">加入</button>
            </>
          ) : (
            <>
              <input value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)} placeholder="输入房间密码" className="bg-ocean-800/50 text-ocean-100 text-xs rounded px-2 py-1 w-28 outline-none border border-ocean-700/50" onKeyDown={(e) => e.key === "Enter" && handleJoinWithPassword()} autoFocus />
              <button onClick={handleJoinWithPassword} className="text-xs text-green-400 hover:text-green-300">确认</button>
            </>
          )}
          <button onClick={() => { setMode("idle"); setJoinCode(""); setJoinPassword(""); setJoinStep("code"); }} className="text-xs text-ocean-500 hover:text-ocean-300">取消</button>
        </div>
      )}

      <div className="flex-1" />
      <span className={partnerOnline ? "text-green-400" : "text-ocean-500"}>● {partnerOnline ? "TA 已加入" : "等待TA..."}</span>
    </div>
  );
}
