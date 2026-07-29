# Task 6 Brief — 视频 src 绑定 + 语音传输修复 + Railway 构建

## Global Constraints
- 构建须通过 `cd D:/clover-blue-planet && pnpm build:web && pnpm --filter server build`
- 不引入新的原生依赖

## 前置依赖
Task 3 已修改 `VideoPlayer.tsx`（新 props：sendSyncState + onSyncState）。本 Task 在此基础之上添加 source→src 绑定。

## 改动

### 文件 A: `packages/shared/src/components/player/VideoPlayer.tsx`

#### 改动 A1：添加 source→src 同步 useEffect

在已有 useEffect 块之后（约音量 useEffect 之后，return 之前），添加：
```typescript
  // 同步 source 到 video 元素 src
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !source) return;
    if (source.type === "file" && source.path) {
      v.src = `file://${source.path}`;
    } else if (source.type === "url" && source.url) {
      v.src = source.url;
    }
  }, [source]);
```

注意：`source` 来自 `usePlayerStore()`，已在组件顶部解构。

### 文件 B: `packages/shared/src/components/chat/MessageInput.tsx`

#### 改动 B1：语音 Blob 转 base64 传输

找到第 58-62 行：
```typescript
        <VoiceRecorder
          onRecorded={(blob) => {
            onSend("[语音消息]", "voice");
          }}
        />
```

替换为：
```typescript
        <VoiceRecorder
          onRecorded={(blob) => {
            // 将 Blob 转为 Base64 以通过 Socket.IO 传输
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              onSend(base64, "voice");
            };
            reader.readAsDataURL(blob);
          }}
        />
```

### 文件 C: `railway.toml`（完整重写）

原文件完整替换为：
```toml
[build]
builder = "nixpacks"
buildCommand = "npm install -g pnpm@8 && pnpm install --filter server && pnpm --filter server build"

[deploy]
startCommand = "node packages/server/dist/index.js"
healthcheckPath = "/health"
restartPolicyType = "always"

[deploy.env]
DATA_DIR = "/data"
```

## 验证
```bash
cd D:/clover-blue-planet && pnpm build:web && pnpm --filter server build
```
