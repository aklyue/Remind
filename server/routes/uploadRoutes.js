const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadFile } = require("../controllers/uploadController");
const storage = require("../utils/storage");

const upload = multer({ storage });

router.post("/", upload.any(), uploadFile);

module.exports = router;
