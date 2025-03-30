const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// const { Pool } = require("pg");

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASS,
//   port: process.env.DB_PORT,
// });

const app = express();

const { PORT, WS_PORT, SECRET_KEY, API_URL } = process.env;
if (!SECRET_KEY) {
  console.error("SECRET_KEY is not defined in .env file");
  process.exit(1);
}

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

async function fetchUserFromDB(userId) {
  const response = await fetch(`http://localhost:3001/users/${userId}`);
  if (!response.ok) {
    throw new Error("User not found");
  }
  return await response.json();
}

async function fetchUsers() {
  const response = await fetch(`http://localhost:3001/users`);
  if (!response.ok) {
    throw new Error("Users not found");
  }
  return await response.json();
}

app.get("/users/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await fetchUserFromDB(userId);
    res.json(user);
  } catch (error) {
    return res.status(404).json({ message: "User not found" });
  }
});

app.put("/users/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const updatedUserData = req.body;

  try {
    const response = await fetch(`http://localhost:3001/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUserData),
    });

    if (!response.ok) {
      throw new Error("Failed to update user data");
    }

    res.status(200).json(updatedUserData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get(`/users`, authMiddleware, async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
