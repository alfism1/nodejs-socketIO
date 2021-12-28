import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const port = 4000;

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  const color = socket.handshake.auth.color;
  if (!username && !color) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  socket.color = color;
  next();
});

io.on("connection", (socket) => {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
      color: socket.color,
    });
  }
  io.emit("users", users);
  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
    color: socket.color,
  });

  socket.on("chat message", (msg) => {
    console.log(msg);
    // socket.broadcast.emit("chat message", msg);
    io.emit("chat message", msg);
  });
});

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
