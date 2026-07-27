@echo off
echo 🍀 四叶草蓝星球 — 桌面端启动中...
cd /d "%~dp0"
start "" http://localhost:3000
call pnpm dev:web
pause
