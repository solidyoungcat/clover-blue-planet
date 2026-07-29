import { createServer, type IncomingMessage, type ServerResponse } from "http";
import https from "https";
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socket";
import { roomExists, hasPassword, getUserCount, getRoomCount, getTotalUsers } from "./rooms";
import { getStats, dbReady, flushSync } from "./db";

const PORT = process.env.PORT || 3001;
const API_VERSION = "1";

// ========== REST API 路由 ==========

function sendJSON(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function handleAPI(req: IncomingMessage, res: ServerResponse): boolean {
  // CORS preflight
  if (req.method === "OPTIONS") {
    sendJSON(res, 204, {});
    return true;
  }

  const url = new URL(req.url || "/", `http://localhost:${PORT}`);

  // GET /api/v1/health
  if (req.method === "GET" && url.pathname === `/api/v${API_VERSION}/health`) {
    sendJSON(res, 200, {
      status: "ok",
      version: API_VERSION,
      uptime: Math.floor(process.uptime()),
      rooms: getRoomCount(),
      users: getTotalUsers(),
      ...getStats(),
    });
    return true;
  }

  // GET /api/v1/rooms/:code
  const roomMatch = url.pathname.match(new RegExp(`^/api/v${API_VERSION}/rooms/([A-Z0-9]{6})$`));
  if (req.method === "GET" && roomMatch) {
    const code = roomMatch[1];
    sendJSON(res, 200, {
      code,
      exists: roomExists(code),
      hasPassword: hasPassword(code),
      userCount: getUserCount(code),
    });
    return true;
  }

  // POST /api/v1/rooms/validate
  if (req.method === "POST" && url.pathname === `/api/v${API_VERSION}/rooms/validate`) {
    let body = "";
    let bodySize = 0;
    const MAX_BODY = 1024;
    req.on("data", (chunk) => {
      bodySize += chunk.length;
      if (bodySize <= MAX_BODY) body += chunk;
    });
    req.on("end", () => {
      if (bodySize > MAX_BODY) {
        sendJSON(res, 413, { error: "请求体过大" });
        return;
      }
      try {
        const { code } = JSON.parse(body);
        sendJSON(res, 200, {
          valid: /^[A-Z0-9]{6}$/.test(code || ""),
          exists: roomExists(code),
        });
      } catch {
        sendJSON(res, 400, { error: "无效的 JSON" });
      }
    });
    return true;
  }

  // GET /api/v1/proxy?url=... (iframe 代理，去除防盗链头)
  if (req.method === "GET" && url.pathname === `/api/v${API_VERSION}/proxy`) {
    const targetUrl = url.searchParams.get("url");
    if (!targetUrl) {
      sendJSON(res, 400, { error: "缺少 url 参数" });
      return true;
    }

    const client = targetUrl.startsWith("https") ? https : http;
    client.get(targetUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, (proxyRes) => {
      // 去除阻止 iframe 的头
      const headers = { ...proxyRes.headers };
      delete headers["x-frame-options"];
      delete headers["content-security-policy"];
      delete headers["content-security-policy-report-only"];
      headers["access-control-allow-origin"] = "*";

      res.writeHead(proxyRes.statusCode || 200, headers);
      proxyRes.pipe(res);
    }).on("error", () => {
      sendJSON(res, 502, { error: "代理请求失败" });
    });
    return true;
  }

  return false;
}

// ========== 启动 ==========

async function start() {
  await dbReady;
  console.log("[db] Messages loaded successfully");

  const httpServer = createServer((req, res) => {
    if (!handleAPI(req, res)) {
      if (req.url === "/" || req.url === "/health") {
        sendJSON(res, 200, { status: "ok" });
        return;
      }
      res.writeHead(200);
      res.end("🍀 四叶草蓝星球 信令服务器");
    }
  });

  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  setupSocket(io);

  // 优雅退出时刷盘
  process.on("SIGTERM", () => { flushSync(); process.exit(0); });
  process.on("SIGINT", () => { flushSync(); process.exit(0); });

  httpServer.listen(PORT, () => {
    console.log(`🍀 四叶草蓝星球 信令服务器 v${API_VERSION} 运行在 :${PORT}`);
    console.log(`   REST API: http://localhost:${PORT}/api/v${API_VERSION}/health`);
  });
}

start().catch((e) => {
  console.error("Failed to start server:", e);
  process.exit(1);
});
