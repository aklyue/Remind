const pool = require("../config/db");

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
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
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET username=$1, email=$2, password=$3, avatar=$4, description=$5,
       followers=$6::json, followed=$7::json, friends=$8::json, posts=$9::json, messages=$10::json
       WHERE id=$11 RETURNING *`,
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

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при обновлении пользователя", error);
    res.status(500).json({ message: "Ошибка при обновлении пользователя" });
  }
};
