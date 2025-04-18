const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const { SECRET_KEY } = process.env;

exports.register = async (req, res) => {
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
  const defaultAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW534s-jmV52ZC0b0fOUMItdLmnHsBkCbJjw&s";

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
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Incorrect email or password" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: "7d",
  });

  res.json({ token, user });
};
