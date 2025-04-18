const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, "../uploads");
    const type = req.body.fileType;

    if (type === "posts") uploadPath = path.join(uploadPath, "posts");
    else if (type === "messages")
      uploadPath = path.join(uploadPath, "messages");
    else if (type === "avatars") uploadPath = path.join(uploadPath, "avatars");
    console.log(`Saving to: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

module.exports = storage;
