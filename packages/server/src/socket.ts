import type { Server, Socket } from "socket.io";
import { joinRoom, leaveRoom, getPartnerId } from "./rooms";

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`[connect] ${socket.id}`);

    socket.on("room:join", (code: string) => {
      socket.join(code);
      const { partnerId } = joinRoom(code, socket.id);

      if (partnerId) {
        io.to(partnerId).emit("room:partner-joined");
        socket.emit("room:partner-joined");
      }

      console.log(`[room:join] ${socket.id} → ${code}`);
    });

    socket.on("room:leave", (code: string) => {
      leaveRoom(code, socket.id);
      socket.leave(code);
      console.log(`[room:leave] ${socket.id} ← ${code}`);
    });

    socket.on("chat:message", (data: { roomCode: string; message: unknown }) => {
      const partner = getPartnerId(data.roomCode, socket.id);
      if (partner) io.to(partner).emit("chat:message", data.message);
    });

    socket.on("sync:state", (data: { roomCode: string; state: unknown }) => {
      socket.to(data.roomCode).emit("sync:state", data.state);
    });

    socket.on("pet:update", (data: { roomCode: string; petState: unknown }) => {
      socket.to(data.roomCode).emit("pet:update", data.petState);
    });

    socket.on("disconnect", () => {
      console.log(`[disconnect] ${socket.id}`);
    });
  });
}
