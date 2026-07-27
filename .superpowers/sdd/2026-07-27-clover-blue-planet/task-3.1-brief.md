# Task 3.1: Electron 桌面端

**Files:**
- Create: `packages/desktop/package.json`
- Create: `packages/desktop/tsconfig.json`
- Create: `packages/desktop/src/main/index.ts`
- Create: `packages/desktop/src/preload/index.ts`

**Interfaces:**
- Consumes: Task 1.1 (monorepo), Task 1.2+ (shared components)
- Produces: Electron app 加载 web 渲染进程，<webview> 支持，原生文件对话框

**Global Constraints:** Electron 28+, webviewTag: true, contextIsolation: true, 中文窗口标题

---

### Step 1: `packages/desktop/package.json`

```json
{
  "name": "desktop",
  "version": "0.0.0",
  "private": true,
  "main": "dist/main/index.js",
  "scripts": {
    "dev": "concurrently \"pnpm --filter web dev\" \"wait-on http://localhost:3000 && electron .\"",
    "build": "pnpm --filter web build && electron-builder"
  },
  "dependencies": {
    "@clover/shared": "workspace:*"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "electron": "^28.0.0",
    "electron-builder": "^24.0.0",
    "typescript": "^5.3.0",
    "wait-on": "^7.2.0"
  }
}
```

### Step 2: `packages/desktop/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

### Step 3: `packages/desktop/src/main/index.ts`

```typescript
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "四叶草蓝星球",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../web/dist/index.html"));
  }
}

ipcMain.handle("dialog:openFile", async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ["openFile"],
    filters: [{ name: "视频文件", extensions: ["mp4", "mkv", "avi", "webm", "mov"] }],
  });
  return result.canceled ? null : result.filePaths[0];
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
```

### Step 4: `packages/desktop/src/preload/index.ts`

```typescript
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
  platform: process.platform,
});
```

### Step 5: 更新 pnpm-workspace.yaml 包含 desktop（如果还没包含 packages/*）

### Step 6: `pnpm install` to install Electron dependencies

### Step 7: Commit `git add -A && git commit -m "feat: add Electron desktop shell with webview and file dialog"`
