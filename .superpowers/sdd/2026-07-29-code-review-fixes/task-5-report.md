# Task 5 Report — 存储层：异步 I/O + 防抖写盘

## 状态：✅ 已完成

## 改动摘要

### 文件 A: `packages/server/src/db.ts`（完整重写）
- 将同步 `fs.mkdirSync` / `fs.readFileSync` / `fs.writeFileSync` 全部改为异步 I/O（`fs.promises.*`）
- 新增 `dbReady: Promise<void>` — 异步初始化，`index.ts` 启动时 `await` 它
- 新增 `scheduleSave()` 防抖写盘机制（500ms 窗口），避免高频 Socket.io 消息触发连续写盘
- 新增 `flushSync()` — 紧急退出时同步刷盘，用于 `SIGTERM`/`SIGINT` 信号处理
- 内部辅助函数 `cleanOldMessages` → 重命名为 `trimRoomMessages`，使用 `Set` 替代 `Array.includes` 提升查找性能
- **接口不变**：`saveMessage()` 和 `getRecentMessages()` 签名完全保持

### 文件 B: `packages/server/src/index.ts`
- import 行从 `"{ getStats }"` 扩展为 `"{ getStats, dbReady, flushSync }"`
- 顶层启动代码包装进 `async function start()`
- 在 `start()` 内部首行 `await dbReady`
- 注册 `process.on("SIGTERM")` / `process.on("SIGINT")` 调用 `flushSync()` 后退出
- 底部的健康检查路由 `if` 条件改为使用 `if` 块形式（原代码无差异但在 diff 上更清晰）

## 构建验证

```bash
cd D:/clover-blue-planet && pnpm --filter server build
```

**结果：** `tsc` 编译成功，exit code 0，无错误。dist/ 目录生成了 db.js、index.js 等输出文件。

## 约束检查

| 约束 | 状态 |
|------|------|
| 不引入原生 C++ 依赖 | ✅ 仅使用 Node.js 内置 `fs`/`path` |
| `saveMessage` 签名不变 | ✅ 参数和返回值完全一致 |
| `getRecentMessages` 签名不变 | ✅ 参数和返回值完全一致 |
| `pnpm --filter server build` 通过 | ✅ exit code 0 |

## 未提交

按要求未执行 `git commit`。
