CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT DEFAULT '/uploads/avatars/default.png',
  description TEXT,
  followers JSON,
  followed JSON,
  friends JSON,
  posts JSON,
  messages JSON
);