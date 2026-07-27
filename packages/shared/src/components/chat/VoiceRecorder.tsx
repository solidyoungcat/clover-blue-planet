import React, { useRef, useState } from "react";

interface VoiceRecorderProps {
  onRecorded: (blob: Blob) => void;
}

export function VoiceRecorder({ onRecorded }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecorded(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecording(true);
    } catch {
      alert("无法访问麦克风，请检查权限设置");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <button
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onMouseLeave={() => recording && stopRecording()}
      className={`btn-ocean btn-sm !px-2 transition-all ${
        recording
          ? "!border-red-400/50 !text-red-400 !shadow-glow-sm animate-pulse"
          : ""
      }`}
      title="按住录音"
    >
      🎤
    </button>
  );
}
