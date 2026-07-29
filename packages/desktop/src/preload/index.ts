import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
  platform: process.platform,
  openExternal: (url: string) => ipcRenderer.invoke("shell:openExternal", url),
});
