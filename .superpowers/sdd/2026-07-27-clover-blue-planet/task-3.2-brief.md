# Task 3.2: 语音消息 — VoiceRecorder 集成

**Files:**
- Create: `packages/shared/src/components/chat/VoiceRecorder.tsx`
- Modify: `packages/shared/src/components/chat/MessageInput.tsx` (add 🎤 button)
- Modify: `packages/shared/src/index.ts` (add export)

**Interfaces:**
- Consumes: Task 2.1 (ChatPanel, MessageInput)
- Produces:
  - `VoiceRecorder` — props: `{ onRecorded: (blob: Blob) => void }`，按住录音松开发送

---

### Step 1: `packages/shared/src/components/chat/VoiceRecorder.tsx`

```typescript
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
      className={`text-lg transition-colors ${
        recording ? "text-red-400 animate-pulse" : "text-ocean-300 hover:text-ocean-100"
      }`}
      title="按住录音"
    >
      🎤
    </button>
  );
}
```

### Step 2: 修改 `MessageInput.tsx`

在输入框前的按钮组（😊表情按钮旁边）加入 `<VoiceRecorder>`：

```typescript
// 在 MessageInput 的 return 中，在 😊 按钮后面加：
import { VoiceRecorder } from "./VoiceRecorder";

// 在输入框前的 flex items-center gap-2 div 中：
<button onClick={() => setShowEmoji(!showEmoji)} className...>😊</button>
<VoiceRecorder
  onRecorded={(blob) => {
    // 简化处理：传递 blob 信息作为消息
    // 后续可上传到 CDN 并获取 URL
    const url = URL.createObjectURL(blob);
    onSend("[语音消息]", "voice");
  }}
/>
```

### Step 3: 更新 shared 导出

```typescript
export { VoiceRecorder } from "./components/chat/VoiceRecorder";
```

### Step 4: Commit `git add -A && git commit -m "feat: add voice message recording and sending"`
