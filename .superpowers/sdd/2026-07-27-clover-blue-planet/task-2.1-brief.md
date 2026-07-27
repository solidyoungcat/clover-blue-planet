# Task 2.1: 聊天面板 — MessageBubble + MessageInput + ChatPanel

**Files:**
- Create: `packages/shared/src/components/chat/ChatPanel.tsx`
- Create: `packages/shared/src/components/chat/MessageBubble.tsx`
- Create: `packages/shared/src/components/chat/MessageInput.tsx`
- Modify: `packages/web/src/App.tsx` (use ChatPanel)
- Modify: `packages/shared/src/index.ts` (追加 exports)

**Interfaces:**
- Consumes: Task 1.3 (chatStore), Task 1.5 (useSocket)
- Produces:
  - `ChatPanel` — props: `{ sendChatMessage: (msg: Message) => void }`
  - `MessageBubble` — props: `{ message: Message }`
  - `MessageInput` — props: `{ onSend: (text: string, type: 'text' | 'emoji') => void }`

---

### Step 1: `packages/shared/src/components/chat/MessageBubble.tsx`

```typescript
import React from "react";
import type { Message } from "../../stores/chatStore";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.sender === "me";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3 px-3`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? "bg-ocean-600 text-white rounded-br-md"
            : "bg-ocean-800/60 text-ocean-100 rounded-bl-md"
        }`}
      >
        {message.type === "voice" ? (
          <div className="flex items-center gap-2 min-w-[120px]">
            <span>🔊</span>
            <span>语音消息 {Math.ceil((message.text?.length || 0) / 10)}"</span>
          </div>
        ) : (
          <span>{message.text}</span>
        )}
        <div className={`text-[10px] mt-1 ${isMe ? "text-ocean-200" : "text-ocean-400"}`}>
          {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
```

### Step 2: `packages/shared/src/components/chat/MessageInput.tsx`

```typescript
import React, { useState } from "react";

const QUICK_EMOJIS = ["😊", "😂", "😍", "🥰", "❤️", "🎬", "🍿", "💕", "😭", "🤣", "🔥", "✨"];

interface MessageInputProps {
  onSend: (text: string, type: "text" | "emoji") => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim(), "text");
    setText("");
  };

  const handleEmojiClick = (emoji: string) => {
    onSend(emoji, "emoji");
    setShowEmoji(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-ocean-700/50">
      {showEmoji && (
        <div className="flex flex-wrap gap-1 px-3 py-2 bg-ocean-900/80">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => handleEmojiClick(e)}
              className="text-xl hover:bg-ocean-700 rounded p-1 transition-colors"
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="text-ocean-300 hover:text-ocean-100 transition-colors text-lg"
        >
          😊
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="说点什么..."
          className="flex-1 bg-ocean-800/50 text-ocean-100 placeholder-ocean-500 rounded-full px-4 py-1.5 text-sm outline-none border border-ocean-700/50 focus:border-ocean-400 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="text-ocean-300 hover:text-ocean-100 disabled:text-ocean-700 transition-colors"
        >
          📎
        </button>
      </div>
    </div>
  );
}
```

### Step 3: `packages/shared/src/components/chat/ChatPanel.tsx`

```typescript
import React, { useEffect, useRef } from "react";
import { useChatStore, type Message } from "../../stores/chatStore";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

interface ChatPanelProps {
  sendChatMessage: (msg: Message) => void;
}

export function ChatPanel({ sendChatMessage }: ChatPanelProps) {
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string, type: "text" | "emoji") => {
    const msg: Message = {
      id: String(Date.now()),
      sender: "me",
      text,
      type,
      timestamp: Date.now(),
    };
    addMessage(msg);
    sendChatMessage(msg);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-ocean-700/50">
        <span className="text-ocean-300 text-sm">💬 聊天</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {messages.length === 0 && (
          <div className="text-center text-ocean-500 text-sm mt-8">
            还没有消息，说点什么吧 💬
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}
```

### Step 4: 更新 `packages/web/src/App.tsx` — chatArea 改为 `<ChatPanel sendChatMessage={sendChatMessage} />`

### Step 5: 更新 `packages/shared/src/index.ts` 追加:

```typescript
export { ChatPanel } from "./components/chat/ChatPanel";
export { MessageBubble } from "./components/chat/MessageBubble";
export { MessageInput } from "./components/chat/MessageInput";
```

### Step 6: 验证 `pnpm dev:web` + `pnpm dev:server` → 发消息测试
### Step 7: Commit `git add -A && git commit -m "feat: add chat panel with text/emoji messaging"`
