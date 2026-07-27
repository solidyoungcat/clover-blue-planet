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
