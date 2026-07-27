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
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
    <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-b from-ocean-900/60 to-ocean-950/40 text-sm border-b border-ocean-800/30">
      {/* 房间码展示 */}
      <div className="flex items-center gap-1.5">
        <span className="text-ocean-500 text-[11px] tracking-widest uppercase">房间</span>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-ocean-950/60 border border-ocean-700/30">
          <code className="text-ocean-100 font-mono text-base tracking-[0.2em] font-medium select-all">
            {roomCode}
          </code>
          <button
            onClick={copyRoomCode}
            className={`btn-ocean btn-sm transition-all ${copied ? "border-emerald-400/50 text-emerald-300 shadow-glow-sm" : ""}`}
          >
            {copied ? "✓ 已复制" : "复制"}
          </button>
        </div>
        <button onClick={generateRoomCode} className="btn-ocean btn-sm text-ocean-400 text-[11px]">
          换码
        </button>
      </div>

      <div className="w-px h-5 bg-ocean-700/30" />

      {/* 操作按钮区 */}
      {mode === "idle" && (
        <div className="flex items-center gap-2">
          <button onClick={() => setMode("create")} className="btn-primary btn-sm">
            🔒 创建房间
          </button>
          <button onClick={() => { setMode("join"); setJoinStep("code"); }} className="btn-ocean btn-sm">
            加入房间
          </button>
        </div>
      )}

      {/* 创建房间面板 */}
      {mode === "create" && (
        <div className="flex items-center gap-2 animate-scale-in">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="设置密码（可选）"
            className="bg-ocean-950/60 text-ocean-100 text-xs rounded-lg px-3 py-1.5 w-36 outline-none border border-ocean-600/30 focus:border-ocean-400/60 focus:shadow-glow-sm transition-all placeholder:text-ocean-600"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <button onClick={handleCreate} className="btn-primary btn-sm">确认创建</button>
          <button onClick={() => { setMode("idle"); setPassword(""); }} className="btn-ocean btn-sm text-ocean-500">取消</button>
        </div>
      )}

      {/* 加入房间面板 */}
      {mode === "join" && joinStep === "code" && (
        <div className="flex items-center gap-2 animate-scale-in">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="输入 6 位房间码"
            maxLength={6}
            className="bg-ocean-950/60 text-ocean-100 text-sm rounded-lg px-3 py-1.5 w-36 font-mono tracking-[0.2em] outline-none border border-ocean-600/30 focus:border-ocean-400/60 focus:shadow-glow-sm transition-all placeholder:text-ocean-600 placeholder:tracking-normal"
            onKeyDown={(e) => e.key === "Enter" && handleJoinCheck()}
            autoFocus
          />
          <button onClick={handleJoinCheck} disabled={joinCode.length !== 6} className="btn-primary btn-sm disabled:opacity-30 disabled:cursor-not-allowed">加入</button>
          <button onClick={() => { setMode("idle"); setJoinCode(""); }} className="btn-ocean btn-sm text-ocean-500">取消</button>
        </div>
      )}

      {mode === "join" && joinStep === "password" && (
        <div className="flex items-center gap-2 animate-scale-in">
          <input
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            placeholder="输入房间密码"
            className="bg-ocean-950/60 text-ocean-100 text-xs rounded-lg px-3 py-1.5 w-36 outline-none border border-ocean-500/30 focus:border-ocean-400/60 focus:shadow-glow-sm transition-all placeholder:text-ocean-600"
            onKeyDown={(e) => e.key === "Enter" && handleJoinWithPassword()}
            autoFocus
          />
          <button onClick={handleJoinWithPassword} className="btn-primary btn-sm">确认</button>
          <button onClick={() => { setMode("idle"); setJoinCode(""); setJoinPassword(""); setJoinStep("code"); }} className="btn-ocean btn-sm text-ocean-500">取消</button>
        </div>
      )}

      <div className="flex-1" />

      {/* 右侧状态 */}
      <span className={`text-xs tracking-wide ${partnerOnline ? "text-emerald-300" : "text-ocean-500"}`}>
        {partnerOnline ? "● 已连接" : "○ 等待中"}
      </span>
    </div>
  );
}
