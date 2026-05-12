const express = require("express");
const cors = require("cors");
const vocabRoutes = require("./routes/vocabRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const practiceRoutes = require("./routes/practiceRoutes");
const roomRoutes = require("./routes/roomRoutes");
const db = require("./config/db");


const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Create tables if not exist
const createTables = () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'siswa',
      progress TEXT,
      xp INT DEFAULT 0,
      level INT DEFAULT 1,
      title VARCHAR(255),
      streak INT DEFAULT 0,
      dialect VARCHAR(50)
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
    )`
  ];

  queries.forEach(query => {
    db.query(query, (err) => {
      if (err) console.log('Error creating table:', err);
    });
  });

  // Add column if not exists
  db.query(
    `ALTER TABLE room_questions ADD COLUMN IF NOT EXISTS answer_type VARCHAR(50)`,
    (err) => {
      if (err) console.log('Error adding column:', err);
    }
  );
};

createTables();

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

app.use("/api/game", require("./routes/gamification"));

app.use("/api/vocab", vocabRoutes);
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/lesson", lessonRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/rooms", require("./routes/roomRoutes"));