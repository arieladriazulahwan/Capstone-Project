require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const vocabRoutes = require("./routes/vocabRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const practiceRoutes = require("./routes/practiceRoutes");
const roomRoutes = require("./routes/roomRoutes");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const createJsonDataTables = require("./utils/jsonDataTables");
const { seedJsonData, logSeedSummary } = require("./scripts/seedJsonData");

const app = express();
const defaultProgressString = () =>
  JSON.stringify({
    bab1: true,
    bab2: false,
    bab3: false,
    bab4: false,
    bab5: false,
    bab6: false,
    bab7: false,
    bab8: false,
    bab9: false,
    bab10: false,
    levels: {
      bab1: { "kata-benda": 0 },
      bab2: {},
      bab3: {},
      bab4: {},
      bab5: {},
      bab6: {},
      bab7: {},
      bab8: {},
      bab9: {},
      bab10: {},
    },
  });

app.use(cors());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// Create tables if not exist
const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'siswa',
      is_blocked TINYINT(1) NOT NULL DEFAULT 0,
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

  await createJsonDataTables(db);

  await ensureColumn("users", "created_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("users", "is_blocked", "TINYINT(1) NOT NULL DEFAULT 0");
  await ensureColumn("room_questions", "answer_type", "VARCHAR(50)");
  await ensureColumn("favorites", "vocab_id", "INT NULL");
  await ensureColumn("rooms", "teacher_id", "INT NULL");
  await migrateFavoriteColumn();
  await removeDuplicateFavorites();
  await ensureUniqueIndex("favorites", "user_vocab_unique", "user_id, vocab_id");
  await ensureExistingStudentData();
};

app.use("/api/auth", authRoutes);
app.use("/api/game", require("./routes/gamification"));
app.use("/api/vocab", vocabRoutes);
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/lesson", lessonRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/admin", adminRoutes);

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

const ensureExistingStudentData = async () => {
  await db.promise().query(
    `INSERT IGNORE INTO student_profiles (user_id, dialect, title)
     SELECT id, 'ledo', 'Pemula'
     FROM users
     WHERE role = 'siswa'`
  );

  for (const dialect of ["ledo", "rai"]) {
    await db.promise().query(
      `INSERT IGNORE INTO student_progress (user_id, dialect, progress)
       SELECT id, ?, ?
       FROM users
       WHERE role = 'siswa'`,
      [dialect, defaultProgressString()]
    );
  }
};

const startServer = async () => {
  try {
    await createTables();

    // 🛠️ PROSES MIGRASI BIGINT AMAN DARI FOREIGN KEY CONSTRAINT
    console.log("⏳ Menyiapkan migrasi kolom ID ke BIGINT...");

    try {
      // 1. Cari tahu nama constraint dan kolom penghubung secara dinamis sebelum di-drop
      const [fkData] = await db.promise().query(
        `SELECT CONSTRAINT_NAME, COLUMN_NAME 
         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'vocab_translations' 
           AND REFERENCED_TABLE_NAME = 'vocab_entries'`
      );

      let fkName = "vocab_translations_ibfk_1";
      let childColumnName = "vocab_entry_id"; // default fallback jika query kosong

      if (fkData.length > 0) {
        fkName = fkData[0].CONSTRAINT_NAME;
        childColumnName = fkData[0].COLUMN_NAME;
      }

      // 2. Drop (Jatuhkan) Foreign Key constraint secara fisik
      try {
        await db.promise().query(`ALTER TABLE vocab_translations DROP FOREIGN KEY \`${fkName}\``);
        console.log(`✅ Constraint ${fkName} berhasil di-drop.`);
      } catch (dropErr) {
        console.log(`ℹ️ Constraint ${fkName} mungkin sudah tidak ada atau di-drop, melanjutkan migrasi...`);
      }

      // 3. Ubah tipe data tabel utama (parent table)
      await db.promise().query("ALTER TABLE vocab_entries MODIFY COLUMN id BIGINT NOT NULL");
      console.log("✅ Kolom id pada tabel vocab_entries berhasil diubah ke BIGINT.");

      // 4. Ubah tipe data tabel anak (child table)
      await db.promise().query(`ALTER TABLE vocab_translations MODIFY COLUMN \`${childColumnName}\` BIGINT NOT NULL`);
      console.log(`✅ Kolom child '${childColumnName}' pada tabel vocab_translations berhasil diubah ke BIGINT.`);

      // 5. Restore (Bangun kembali) Foreign Key Constraint dengan ON DELETE CASCADE
      await db.promise().query(`
        ALTER TABLE vocab_translations 
        ADD CONSTRAINT \`${fkName}\` 
        FOREIGN KEY (\`${childColumnName}\`) 
        REFERENCES vocab_entries(id) 
        ON DELETE CASCADE
      `);
      console.log(`✅ Constraint ${fkName} berhasil dibangun kembali dengan ON DELETE CASCADE.`);

      // 6. Ubah tipe data source_id pada quiz_items (untuk menampung timestamp besar)
      try {
        await db.promise().query("ALTER TABLE quiz_items MODIFY COLUMN source_id BIGINT");
        console.log("✅ Kolom source_id pada tabel quiz_items berhasil diubah ke BIGINT.");
      } catch (err) {
        console.log("ℹ️ Tabel quiz_items mungkin belum ada atau tidak memiliki source_id, melanjutkan...");
      }

      console.log("✅ Keseluruhan struktur tabel database berhasil disesuaikan ke BIGINT dengan aman.");
    } catch (migErr) {
      console.error("❌ Gagal melakukan migrasi BIGINT:", migErr);
      throw migErr; // Lempar error agar ditangkap oleh catch utama startServer
    }

    // Jalankan Seeder
    const seedSummary = await seedJsonData();
    logSeedSummary(seedSummary);

    await seedAdmin();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Gagal menyiapkan database:", err);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  const bcrypt = require("bcrypt");
  const [rows] = await db.promise().query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
  if (rows.length === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.promise().query(
      "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
      ["Administrator", "admin", hashedPassword, "admin"]
    );
    console.log("✅ Akun admin default berhasil dibuat (admin / admin123)");
  }
};

startServer();