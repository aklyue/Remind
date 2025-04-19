const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const { setupWebSocket } = require("./utils/websocket");

dotenv.config();

const app = express();
const { PORT } = process.env;
app.use(cors({
  origin: "https://amused-appreciation-production.up.railway.app",
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/upload", uploadRoutes);

app.listen(PORT,() => {
  console.log(`Server is running on port ${PORT}`);
});

setupWebSocket();
