const { createServer } = require("http");
const { Server }       = require("socket.io");

const PORT = process.env.SOCKET_PORT ?? 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin:      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    methods:     ["GET", "POST"],
    credentials: true,
  },
});

// Track which socket belongs to which user
const userSockets = new Map(); // userId → socketId

io.on("connection", (socket) => {
  const { userId, role } = socket.handshake.auth;

  if (userId) {
    userSockets.set(userId, socket.id);
    socket.join(`user:${userId}`);
    if (role === "admin") socket.join("admins");
    console.log(`[Socket] Connected: ${userId} (${role})`);
  }

  socket.on("disconnect", () => {
    if (userId) userSockets.delete(userId);
    console.log(`[Socket] Disconnected: ${userId}`);
  });
});

// Export emitter so API routes can call it
// In a real production system this would use Redis pub/sub
global.__socketIO = io;

httpServer.listen(PORT, () => {
  console.log(`[Socket.io] Running on port ${PORT}`);
});
