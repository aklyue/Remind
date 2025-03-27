const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());


const PORT = process.env.PORT;
const WS_PORT = process.env.WS_PORT;
const API_URL = process.env.API_URL;
const SECRET_KEY = process.env.SECRET_KEY;

app.use((req, res, next) => {
  console.log("SECRET_KEY:", SECRET_KEY);
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ port: WS_PORT });
let clients = new Map();

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const response = await fetch(API_URL);
  const users = await response.json();

  if (users.some((user) => user.email === email)) {
    return res
      .status(400)
      .json({ message: "This email is already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    username: email,
    email,
    password: hashedPassword,
    followers: [],
    followed: [],
    friends: [],
    avatar:
      "https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
    description: "",
    posts: [],
    messages: [],
  };

  const saveResponse = await fetch("http://localhost:3001/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });

  if (!saveResponse.ok) {
    return res.status(500).json({ message: "Failed to save user" });
  }

  const savedUser = await saveResponse.json();

  const token = jwt.sign(
    { id: savedUser.id, email: savedUser.email },
    SECRET_KEY,
    { expiresIn: "7d" }
  );

  res.json({ token, user: savedUser });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const response = await fetch(API_URL);
  const users = await response.json();

  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(400).json({ message: "Incorrect email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Incorrect email or password" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: "7d",
  });

  res.json({ token, user });
});

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const msg = JSON.parse(message);

    if (msg.event === "connection") {
      clients.set(msg.id, ws);
      console.log(`User ${msg.username} connected.`);
      return;
    }

    if (msg.event === "message") {
      console.log(
        `Message from ${msg.username} to ${msg.recipientId}: ${msg.message}`
      );

      const recipientSocket = clients.get(msg.recipientId);
      if (recipientSocket) {
        recipientSocket.send(JSON.stringify(msg));
      }

      const senderSocket = clients.get(msg.id);
      if (senderSocket) {
        senderSocket.send(JSON.stringify(msg));
      }
    }
  });

  ws.on("close", () => {
    clients.forEach((socket, userId) => {
      if (socket === ws) {
        clients.delete(userId);
        console.log(`User ${userId} disconnected.`);
      }
    });
  });
});
