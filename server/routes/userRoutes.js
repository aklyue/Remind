const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getUser,
  updateUser,
} = require("../controllers/userController");

router.get("/", auth, getAllUsers);
router.get("/:userId", auth, getUser);
router.put("/:userId", auth, updateUser);

module.exports = router;
