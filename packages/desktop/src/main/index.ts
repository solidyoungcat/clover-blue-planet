import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);
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

  mainWindow.loadURL("http://localhost:3000");
  mainWindow.webContents.openDevTools();
}

// 视频解析 — 在主进程中运行 yt-dlp
ipcMain.handle("resolve:video", async (_event, url: string) => {
  const isWebpage = !/\.(mp4|webm|mkv|avi|mov|flv|wmv)($|\?)/i.test(url);
  if (!isWebpage) return { url }; // 已经是视频直链

  const commands = [
    "python3 -m yt_dlp",
    "python -m yt_dlp",
    "yt-dlp",
  ];

  for (const cmd of commands) {
    try {
      const args = [
        `"${url}"`,
        "--format", "best[ext=mp4]/best",
        "--get-url",
        "--get-title",
        "--no-playlist",
        "--socket-timeout", "20",
      ].join(" ");

      const { stdout } = await execAsync(`${cmd} ${args}`, { timeout: 25000 });
      const lines = stdout.trim().split("\n");
      const streamUrl = lines.pop()?.trim();
      const title = lines.join("\n").trim() || undefined;

      if (streamUrl && streamUrl.startsWith("http")) {
        return { url: streamUrl, title };
      }
    } catch {
      // 尝试下一个
    }
  }

  return { url: null, error: "无法解析" };
});

ipcMain.handle("dialog:openFile", async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ["openFile"],
    filters: [{ name: "视频文件", extensions: ["mp4", "mkv", "avi", "webm", "mov"] }],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("shell:openExternal", async (_event, url: string) => {
  await shell.openExternal(url);
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
