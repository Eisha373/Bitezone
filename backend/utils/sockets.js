import { Server } from "socket.io";
let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("joinOrder", (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on("leaveOrder", (orderId) => {
      socket.leave(`order:${orderId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}