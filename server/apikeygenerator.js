const crypto = require("crypto");

// Генерация случайного ключа длиной 64 байта
const secretKey = crypto.randomBytes(64).toString("hex");

console.log("SECRET_KEY=" + secretKey);
