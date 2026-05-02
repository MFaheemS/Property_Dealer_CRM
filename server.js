const { createServer } = require("http");
const { parse }        = require("url");
const next             = require("next");
const { Server }       = require("socket.io");

const dev  = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);
const app  = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin:      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      methods:     ["GET", "POST"],
      credentials: true,
    },
  });

  // Make io available to Next.js API routes in the same process
  global.__socketIO = io;

  const userSockets = new Map();

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

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Socket.io attached on the same port`);
  });
});
