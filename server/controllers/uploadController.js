exports.uploadFile = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Ошибка загрузки файла" });
  }

  const urls = req.files.map((file) => {
    const fileType = req.body.fileType || "default";
    return `http://localhost:4000/uploads/${fileType}/${file.filename}`;
  });

  res.json({ urls });
};
