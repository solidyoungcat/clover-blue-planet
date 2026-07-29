import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
  platform: process.platform,
  resolveVideo: (url: string) => ipcRenderer.invoke("resolve:video", url),
  openExternal: (url: string) => ipcRenderer.invoke("shell:openExternal", url),
  /** 一键解析并设置 video.src（绕过 React 渲染层，直接操作 DOM） */
  resolveAndPlay: async (url: string) => {
    const result = await ipcRenderer.invoke("resolve:video", url);
    if (result?.url) {
      // 通过 IPC 返回结果，由渲染进程设置 video src
      return { success: true, url: result.url, title: result.title };
    }
    return { success: false, error: result?.error || "无法解析" };
  },
});
