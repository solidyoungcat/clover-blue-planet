import { app, BrowserWindow, ipcMain, dialog, shell, protocol } from "electron";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import os from "os";

const execAsync = promisify(exec);
let mainWindow: BrowserWindow | null = null;

// 视频临时下载目录（与后端 data/ 同级，方便后端静态服务）
const VIDEO_DIR = path.join(os.tmpdir(), "clover-videos");

function ensureVideoDir() {
  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

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

  // 开发模式：加载 Vite dev server；打包模式：加载本地文件
  if (process.env.NODE_ENV === "development" || !fs.existsSync(path.join(__dirname, "../../web/dist/index.html"))) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../web/dist/index.html"));
  }
  mainWindow.webContents.openDevTools();
}

// 视频解析 — 下载到本地文件，返回后端静态 URL
ipcMain.handle("resolve:video", async (_event, url: string) => {
  const isWebpage = !/\.(mp4|webm|mkv|avi|mov|flv|wmv)($|\?)/i.test(url);
  if (!isWebpage) return { url };

  ensureVideoDir();

  // 提取视频 ID 作为文件名
  const videoId = url.match(/BV[\w]+/)?.[0] || Date.now().toString(36);
  const outPath = path.join(VIDEO_DIR, `${videoId}.mp4`);

  // 如果已经下载过，直接返回
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
    return { url: `local-video://${outPath.replace(/\\/g, "/")}`, cached: true };
  }

  // 优先使用打包的 yt-dlp.exe，其次用系统 Python
  const bundledYtdlp = path.join(__dirname, "../../../yt-dlp.exe");
  const commands = fs.existsSync(bundledYtdlp)
    ? [`"${bundledYtdlp}"`]
    : [
        "python3 -m yt_dlp",
        "python -m yt_dlp",
        "yt-dlp",
      ];

  for (const cmd of commands) {
    try {
      const args = [
        `"${url}"`,
        `-o "${outPath}"`,
        "--format", "bv*+ba/best",
        "--merge-output-format", "mp4",
        "--no-playlist",
        "--socket-timeout", "20",
        "--no-progress",
      ].join(" ");

      await execAsync(`${cmd} ${args}`, { timeout: 60000 });

      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
        return { url: `local-video://${outPath.replace(/\\/g, "/")}` };
      }
    } catch {
      // 尝试下一个命令
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

app.whenReady().then(() => {
  // 注册本地视频文件协议，避免 CORS 问题
  protocol.registerFileProtocol("local-video", (request, callback) => {
    const filePath = decodeURIComponent(request.url.replace("local-video://", ""));
    callback({ path: filePath });
  });
  ensureVideoDir();
  createWindow();
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
