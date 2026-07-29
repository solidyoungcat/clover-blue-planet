@echo off
chcp 65001 >nul
title 🍀 四叶草蓝星球 — 一键启动
cd /d "%~dp0"

echo.
echo   🍀 四叶草蓝星球 — Clover Blue Planet
echo   ════════════════════════════════════
echo.

:: ========== 检查 Node.js ==========
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo   ❌ 未找到 Node.js！请先从 https://nodejs.org 下载安装
    echo      安装后重新运行此脚本。
    pause
    exit /b 1
)
echo   ✅ Node.js: %node_version%

:: ========== 检查/安装 pnpm ==========
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo   📦 安装 pnpm...
    call npm install -g pnpm
)
echo   ✅ pnpm 已就绪

:: ========== 安装项目依赖 ==========
echo   📥 安装项目依赖（首次需要几分钟）...
call pnpm install --frozen-lockfile 2>nul
if %errorlevel% neq 0 (
    echo   ⚠️ 使用 --no-frozen-lockfile 重试...
    call pnpm install
)

:: ========== 构建后端 ==========
echo   🔧 构建后端...
call pnpm --filter server build
if %errorlevel% neq 0 (
    echo   ❌ 后端构建失败！
    pause
    exit /b 1
)

:: ========== 构建前端 ==========
echo   🔧 构建前端...
call pnpm build:web
if %errorlevel% neq 0 (
    echo   ❌ 前端构建失败！
    pause
    exit /b 1
)

:: ========== 检查/安装 yt-dlp ==========
echo   🎬 检查 B站/YouTube 解析工具...
python -m yt_dlp --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   📦 安装 yt-dlp（视频解析引擎）...
    pip install yt-dlp
)

:: ========== 编译桌面端 ==========
echo   🖥 编译桌面端...
cd packages\desktop
call npx tsc
cd ..\..

:: ========== 启动 ==========
echo.
echo   🚀 启动中... 请稍候
echo   ═══════════════════════
echo.

:: 启动后端（端口 4099）
start "🍀 后端服务" cmd /c "cd /d %cd% && PORT=4099 node packages\server\dist\index.js"

:: 等待后端就绪
timeout /t 2 /nobreak >nul

:: 启动前端
start "🍀 前端服务" cmd /c "cd /d %cd%\packages\web && npx vite --port 3000"

:: 等待前端就绪
timeout /t 3 /nobreak >nul

:: 打开浏览器
start http://localhost:3000

:: 启动桌面端
start "🍀 桌面端" cmd /c "cd /d %cd%\packages\desktop && npx electron ."

echo.
echo   ✅ 全部启动完成！
echo   🌐 网页版: http://localhost:3000
echo   📡 后端:   http://localhost:4099
echo.
echo   把 6 位房间码分享给对方，就可以开始同步观影啦 🍿
echo.
echo   关闭此窗口不会影响运行中的服务。
echo   ═══════════════════════════════════════
echo.
pause
