const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const { setupWebSocket } = require("./utils/websocket");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors({
  origin: ["https://amused-appreciation-production.up.railway.app", "http://localhost:4000"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/upload", uploadRoutes);

let clients = new Map();
let rooms = new Map();

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    const { event, id, username, avatar, recipientId, groupId, text } = msg;

    if (event === "connection") {
      clients.set(id, ws);
      return;
    }

    if (event === "join_room") {
      if (!rooms.has(groupId)) rooms.set(groupId, new Set());
      rooms.get(groupId).add(id);
      ws.groupId = groupId;
      return;
    }

    if (event === "message") {
      const recipientSocket = clients.get(recipientId);
      if (recipientSocket) recipientSocket.send(JSON.stringify(msg));
      const senderSocket = clients.get(id);
      if (senderSocket) senderSocket.send(JSON.stringify(msg));
    } else if (groupId) {
      if (rooms.has(groupId)) {
        rooms.get(groupId).forEach((userId) => {
          const client = clients.get(userId);
          if (client?.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        });
      }
    }
  });

  ws.on("close", () => {
    clients.forEach((socket, userId) => {
      if (socket === ws) {
        clients.delete(userId);
      }
    });
  });
});

app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
