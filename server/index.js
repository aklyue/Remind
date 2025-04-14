const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

const { PORT, WS_PORT, SECRET_KEY, API_URL } = process.env;
if (!SECRET_KEY) {
  console.error("SECRET_KEY is not defined in .env file");
  process.exit(1);
}

app.use(
  cors({
    origin: [
      "http://localhost:3000"
    ],
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

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = req.body.fileType;

    let uploadPath = path.join(__dirname, "./uploads");

    if (fileType === "posts") {
      uploadPath = path.join(uploadPath, "posts");
    } else if (fileType === "messages") {
      uploadPath = path.join(uploadPath, "messages");
    } else if (fileType === "avatars") {
      uploadPath = path.join(uploadPath, "avatars");
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.any(), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Ошибка загрузки файла" });
  }

  const urls = req.files.map((file) => {
    const fileType = req.body.fileType || "default";
    return `http://localhost:4000/uploads/${fileType}/${file.filename}`;
  });

  res.json({ urls });
});

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

async function fetchGroupFromDB(groupId, userId) {
  const response = await fetch(
    `http://localhost:5432/users/${userId}/groups/${groupId}`
  );
  console.log(response);
  if (!response.ok) {
    throw new Error("User not found");
  }
  return await response.json();
}

app.get("/users/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/users/:userId/groups/:groupId", authMiddleware, async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.params;

  console.log("ads");
  try {
    const user = await fetchGroupFromDB(groupId, userId);
    res.json(user);
  } catch (error) {
    return res.status(404).json({ message: "User not found" });
  }
});

app.put("/users/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const updatedUser = req.body;
  try {
    const {
      username,
      email,
      password,
      avatar,
      description,
      followers,
      followed,
      friends,
      posts,
      messages,
    } = updatedUser;

    const result = await pool.query(
      `
      UPDATE users SET
        username = $1,
        email = $2,
        password = $3,
        avatar = $4,
        description = $5,
        followers = $6::json,
        followed = $7::json,
        friends = $8::json,
        posts = $9::json,
        messages = $10::json
      WHERE id = $11
      RETURNING *
      `,
      [
        username,
        email,
        password,
        avatar,
        description,
        JSON.stringify(followers),
        JSON.stringify(followed),
        JSON.stringify(friends),
        JSON.stringify(posts),
        JSON.stringify(messages),
        userId,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("🔥 Ошибка при обновлении пользователя:", error, updatedUser);
    res.status(500).json({ message: "Ошибка при обновлении пользователя" });
  }
});

app.put("/users/:userId/groups/:groupId", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const { groupId } = req.params;
  const updatedGroupData = req.body;

  try {
    const response = await fetch(
      `http://localhost:3001/users/${userId}/groups/${groupId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedGroupData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update user data");
    }

    res.status(200).json(updatedGroupData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/users", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    return res
      .status(400)
      .json({ message: "This email is already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const defaultAvatar =
    "https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";

  const result = await pool.query(
    `INSERT INTO users (username, email, password, avatar, description, followers, followed, friends, posts, messages)
     VALUES ($1, $2, $3, $4, '', '[]', '[]', '[]', '[]', '[]') RETURNING *`,
    [email, email, hashedPassword, defaultAvatar]
  );

  const newUser = result.rows[0];
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, {
    expiresIn: "7d",
  });

  res.json({ token, user: newUser });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];
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

const wss = new WebSocket.Server({ port: WS_PORT });
let clients = new Map();
let rooms = new Map();

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    const { event, id, username, avatar, recipientId, groupId, text } = msg;

    if (msg.event === "connection") {
      clients.set(msg.id, ws);
      console.log(`User ${msg.username} connected.`);
      return;
    }

    if (event === "join_room") {
      if (!rooms.has(groupId)) {
        rooms.set(groupId, new Set());
      }
      rooms.get(groupId).add(id);
      ws.groupId = groupId;
      console.log(`User ${username} joined room ${groupId}`);
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
    } else if (groupId) {
      console.log(`Group message from ${username} in room ${groupId}: ${text}`);

      if (rooms.has(groupId)) {
        rooms.get(groupId).forEach((userId) => {
          const client = clients.get(userId);
          if (client && client.readyState === WebSocket.OPEN) {
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
        console.log(`User ${userId} disconnected.`);
      }
    });
  });
});
