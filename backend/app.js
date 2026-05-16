const express = require("express");
const cors = require("cors");
const vocabRoutes = require("./routes/vocabRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const practiceRoutes = require("./routes/practiceRoutes");
const roomRoutes = require("./routes/roomRoutes");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");


const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Create tables if not exist
const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'siswa',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login DATE DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS student_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      xp INT NOT NULL DEFAULT 0,
      level INT NOT NULL DEFAULT 1,
      streak INT NOT NULL DEFAULT 0,
      title VARCHAR(255) NOT NULL DEFAULT 'Pemula',
      dialect VARCHAR(50) NOT NULL DEFAULT 'ledo',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY user_profile_unique (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS student_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      dialect VARCHAR(50) NOT NULL DEFAULT 'ledo',
      progress LONGTEXT DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY user_dialect_unique (user_id, dialect),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      timer INT,
      code VARCHAR(10) UNIQUE NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS room_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id INT NOT NULL,
      type VARCHAR(50),
      question TEXT,
      image LONGTEXT,
      answer LONGTEXT,
      answer_type VARCHAR(50),
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS room_options (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_id INT NOT NULL,
      option_text TEXT,
      FOREIGN KEY (question_id) REFERENCES room_questions(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS room_blocks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_id INT NOT NULL,
      block_text TEXT,
      FOREIGN KEY (question_id) REFERENCES room_questions(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS room_attempts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id INT NOT NULL,
      user_id INT NOT NULL,
      score INT DEFAULT 0,
      total INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS room_attempt_answers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      attempt_id INT NOT NULL,
      question_id INT NOT NULL,
      answer LONGTEXT,
      is_correct TINYINT(1) DEFAULT 0,
      FOREIGN KEY (attempt_id) REFERENCES room_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES room_questions(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS favorites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      vocab_id INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY user_vocab_unique (user_id, vocab_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  ];

  for (const query of queries) {
    await db.promise().query(query);
  }

  await ensureColumn("users", "created_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("room_questions", "answer_type", "VARCHAR(50)");
  await ensureColumn("favorites", "vocab_id", "INT NULL");
  await migrateFavoriteColumn();
  await removeDuplicateFavorites();
  await ensureUniqueIndex("favorites", "user_vocab_unique", "user_id, vocab_id");
};

app.use("/api/auth", authRoutes);
app.use("/api/game", require("./routes/gamification"));
app.use("/api/vocab", vocabRoutes);
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/lesson", lessonRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/rooms", roomRoutes);

const ensureColumn = async (table, column, definition) => {
  const [rows] = await db.promise().query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [table, column]
  );

  if (rows.length === 0) {
    await db.promise().query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

const ensureUniqueIndex = async (table, indexName, columns) => {
  const [rows] = await db.promise().query(
    `SELECT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?`,
    [table, indexName]
  );

  if (rows.length === 0) {
    await db.promise().query(`ALTER TABLE ${table} ADD UNIQUE KEY ${indexName} (${columns})`);
  }
};

const hasColumn = async (table, column) => {
  const [rows] = await db.promise().query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [table, column]
  );

  return rows.length > 0;
};

const migrateFavoriteColumn = async () => {
  const hasWordId = await hasColumn("favorites", "word_id");
  if (hasWordId) {
    await db.promise().query(
      "UPDATE favorites SET vocab_id = word_id WHERE vocab_id IS NULL"
    );
  }
};

const removeDuplicateFavorites = async () => {
  await db.promise().query(
    `DELETE f1 FROM favorites f1
     JOIN favorites f2
       ON f1.user_id = f2.user_id
      AND f1.vocab_id = f2.vocab_id
      AND f1.id > f2.id
     WHERE f1.vocab_id IS NOT NULL`
  );
};

const startServer = async () => {
  try {
    await createTables();
    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  } catch (err) {
    console.error("Gagal menyiapkan database:", err);
    process.exit(1);
  }
};

startServer();
