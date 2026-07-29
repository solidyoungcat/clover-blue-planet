# Task 6 实施报告 — 视频 src 绑定 + 语音传输修复 + Railway 构建

## 状态：✅ 全部完成

构建通过：`pnpm build:web` ✅ | `pnpm --filter server build` ✅

---

## 改动 1：VideoPlayer.tsx — source→src useEffect

**文件：** `packages/shared/src/components/player/VideoPlayer.tsx`

在第 33 行（volume useEffect 之后，return 之前）添加了 source→src 同步 useEffect：

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

- `source` 来自 `usePlayerStore()`，已在组件顶部解构
- 依赖数组为 `[source]`，source 变化时自动将正确的 URL 写入 `<video>` 元素的 `src` 属性
- 保留 Task 3 已有的新 props（`sendSyncState` / `onSyncState`）

---

## 改动 2：MessageInput.tsx — 语音 Blob→base64

**文件：** `packages/shared/src/components/chat/MessageInput.tsx`

将第 58-62 行的 VoiceRecorder onRecorded 回调从简单占位符改为 Blob→base64 转换：

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

- 使用 `FileReader.readAsDataURL()` 将录音 Blob 转为 base64 data URL
- base64 字符串通过 Socket.IO 传输，接收端可直接用作 `<audio>` 的 src

---

## 改动 3：railway.toml — 完整重写

**文件：** `railway.toml`

从旧的 `cd packages/server && npm install && npx tsc` 重写为使用 pnpm 和 nixpacks 的规范构建：

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

- 使用 pnpm@8 替代 npm，匹配项目包管理器
- buildCommand 先安装全局 pnpm，再安装依赖和构建
- startCommand 指向根路径的 `packages/server/dist/index.js`
- 新增 `DATA_DIR` 环境变量指向 `/data`

---

## 构建结果

```
pnpm build:web  → tsc + vite build → ✓ 101 modules, built in 2.05s
pnpm --filter server build  → tsc → ✓ exit 0
```

无编译错误、无新增依赖。
