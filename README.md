# 🍀 四叶草蓝星球 — 安装与使用指南

> 异地情侣同步观影 | React + Electron + Socket.IO

---

## 方式一：网页版（最简单，无需安装）

直接打开 👉 **[clover-blue-planet.pages.dev](https://clover-blue-planet.pages.dev)**

前提：后端服务器已运行（见下方"启动后端"）

---

## 方式二：桌面版（完整体验，支持 B站/YouTube 解析）

### 第一步：安装环境（仅首次）

你需要安装以下工具（都是免费开源软件）：

| 工具 | 下载地址 | 说明 |
|------|---------|------|
| **Node.js 18+** | https://nodejs.org | 下载 LTS 版，一路"下一步"安装 |
| **Python 3** | https://www.python.org | 安装时勾选 ✅ "Add Python to PATH" |

安装完 Node.js 后，打开**命令提示符**或 **PowerShell**，输入：
```bash
npm install -g pnpm
```

### 第二步：下载项目

```bash
git clone https://github.com/solidyoungcat/clover-blue-planet.git
cd clover-blue-planet
```

如果没有 git，也可以在 GitHub 页面点 **Code → Download ZIP**，解压后进入文件夹。

### 第三步：一键安装 + 启动

双击项目文件夹里的 **`一键启动.bat`**，脚本会自动：
1. 安装所有依赖
2. 安装 yt-dlp（B站/YouTube 视频解析工具）
3. 启动后端服务器
4. 启动前端页面
5. 启动桌面应用

### 第四步：开始使用

1. 桌面端窗口会弹出，顶部有一个 **6 位房间码**
2. 把这串房间码告诉你的另一半
3. 对方也打开应用 → 点"加入房间" → 输入房间码
4. 连接成功后，两个人就可以同步观影啦！

---

## 功能说明

| 功能 | 操作 |
|------|------|
| 🎬 播放视频 | 点"本地文件"选视频 / 点"网页链接"粘贴 B站/YouTube 链接 |
| 💬 聊天 | 右侧面板打字发送 / 点 😊 发表情 |
| 🎤 语音 | 按住 🎤 按钮说话，松开发送 |
| 🐱 宠物 | 点击底部宠物互动（喂食/玩耍）|
| 🎥 影院模式 | 点播放器右下角全屏按钮 |

---

## 常见问题

**Q: 提示"无法解析该链接"？**
A: 确认已安装 Python 和 yt-dlp。在终端运行 `pip install yt-dlp`。

**Q: 桌面端打不开？**
A: 先确认 Node.js 已安装。终端运行 `node --version` 看是否显示版本号。

**Q: 对方连不上我的房间？**
A: 房间码只有 6 位大写字母数字。重新复制房间码发给对方，确保两个人连的是同一个后端服务器。

**Q: macOS 用户怎么用？**
A: 目前只测试了 Windows。macOS 用户可以用网页版（方式一），或参考开发文档自行构建桌面端。

---

## 开发者信息

- 技术栈：React 18 + Vite 5 + Electron 28 + Socket.IO 4 + Tailwind CSS
- 仓库：https://github.com/solidyoungcat/clover-blue-planet
- 协议：MIT
