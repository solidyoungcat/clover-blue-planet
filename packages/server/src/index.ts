import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socket";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

setupSocket(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🍀 四叶草蓝星球 信令服务器运行在 :${PORT}`);
});
