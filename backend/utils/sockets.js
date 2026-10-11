import { Server } from "socket.io";

let io;

export function initSocket(server) {
  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim());

io = new Server(server, {
  cors: { origin: allowedOrigins },
});

  io.on("connection", (socket) => {
    socket.on("joinUser", (userId) => {
      socket.join(`user:${userId}`);
    });
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