// server — Socket.IO 服务端入口
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(`客户端已连接: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`客户端已断开: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`服务器已启动，端口 ${PORT}`);
});
