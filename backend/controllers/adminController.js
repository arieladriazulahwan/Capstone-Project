const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("../config/db");

// ============================================
// 📂 FILE PATHS
// ============================================
const vocabPath = path.join(__dirname, "../data/vocab.json");
const quizPath = path.join(__dirname, "../data/quiz.json");
const lessonDir = path.join(__dirname, "../data/lesson");

const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf-8"));
const writeJSON = (filePath, data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

// ============================================
// 📊 DASHBOARD STATS
// ============================================
exports.getDashboardStats = async (req, res) => {
  try {
    const [users] = await db
      .promise()
      .query(
        "SELECT role, COUNT(*) as count FROM users WHERE role != 'admin' GROUP BY role"
      );
    const [rooms] = await db
      .promise()
      .query("SELECT COUNT(*) as count FROM rooms");

    const vocab = readJSON(vocabPath);
    const quiz = readJSON(quizPath);

    const stats = {
      totalSiswa: 0,
      totalGuru: 0,
      totalVocab: vocab.length,
      totalQuiz: quiz.length,
      totalRooms: rooms[0].count,
    };

    users.forEach((row) => {
      if (row.role === "siswa") stats.totalSiswa = row.count;
      if (row.role === "guru") stats.totalGuru = row.count;
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil statistik" });
  }
};

// ============================================
// 🔤 CRUD KAMUS (vocab.json)
// ============================================
exports.getAllVocab = (req, res) => {
  try {
    const data = readJSON(vocabPath);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal membaca kamus" });
  }
};

exports.addVocab = (req, res) => {
  try {
    const data = readJSON(vocabPath);
    const { indonesia, translations, category } = req.body;

    if (!indonesia || !translations) {
      return res
        .status(400)
        .json({ message: "Field indonesia dan translations wajib diisi" });
    }

    const newVocab = {
      id: Date.now(),
      indonesia,
      translations: translations || [],
      category: category || "",
    };

    data.push(newVocab);
    writeJSON(vocabPath, data);

    res.json({ message: "Kosakata berhasil ditambah", data: newVocab });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambah kosakata" });
  }
};

exports.updateVocab = (req, res) => {
  try {
    const data = readJSON(vocabPath);
    const id = Number(req.params.id);
    const index = data.findIndex((v) => v.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Kosakata tidak ditemukan" });
    }

    const { indonesia, translations, category } = req.body;

    if (indonesia !== undefined) data[index].indonesia = indonesia;
    if (translations !== undefined) data[index].translations = translations;
    if (category !== undefined) data[index].category = category;

    writeJSON(vocabPath, data);

    res.json({ message: "Kosakata berhasil diupdate", data: data[index] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengupdate kosakata" });
  }
};

exports.deleteVocab = (req, res) => {
  try {
    const data = readJSON(vocabPath);
    const id = Number(req.params.id);
    const index = data.findIndex((v) => v.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Kosakata tidak ditemukan" });
    }

    const deleted = data.splice(index, 1);
    writeJSON(vocabPath, data);

    res.json({ message: "Kosakata berhasil dihapus", data: deleted[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus kosakata" });
  }
};

// ============================================
// 📖 CRUD MATERI (lesson JSON files)
// ============================================
exports.getLessons = (req, res) => {
  try {
    const dialects = ["ledo", "rai"];
    const lessons = [];

    dialects.forEach((dialect) => {
      const dialectDir = path.join(lessonDir, dialect);
      if (!fs.existsSync(dialectDir)) return;

      const files = fs.readdirSync(dialectDir).filter((f) => f.endsWith(".json"));
      files.forEach((file) => {
        const bab = file.replace(".json", "");
        const content = readJSON(path.join(dialectDir, file));
        lessons.push({
          dialect,
          bab,
          title: content.title || bab,
          hasContent: true,
        });
      });
    });

    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membaca daftar materi" });
  }
};

exports.getLesson = (req, res) => {
  try {
    const { dialect, bab } = req.params;
    const filePath = path.join(lessonDir, dialect, `${bab}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Materi tidak ditemukan" });
    }

    const data = readJSON(filePath);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal membaca materi" });
  }
};

exports.updateLesson = (req, res) => {
  try {
    const { dialect, bab } = req.params;
    const dialectDir = path.join(lessonDir, dialect);

    if (!fs.existsSync(dialectDir)) {
      fs.mkdirSync(dialectDir, { recursive: true });
    }

    const filePath = path.join(dialectDir, `${bab}.json`);
    writeJSON(filePath, req.body);

    res.json({ message: "Materi berhasil disimpan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan materi" });
  }
};

exports.deleteLesson = (req, res) => {
  try {
    const { dialect, bab } = req.params;
    const filePath = path.join(lessonDir, dialect, `${bab}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Materi tidak ditemukan" });
    }

    fs.unlinkSync(filePath);
    res.json({ message: "Materi berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus materi" });
  }
};

// ============================================
// 📝 CRUD KUIS (quiz.json)
// ============================================
exports.getAllQuiz = (req, res) => {
  try {
    const data = readJSON(quizPath);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Gagal membaca kuis" });
  }
};

exports.addQuiz = (req, res) => {
  try {
    const data = readJSON(quizPath);
    const { question, options, answer, dialect, bab } = req.body;

    if (!question || !options || answer === undefined || !dialect || !bab) {
      return res.status(400).json({ message: "Semua field kuis wajib diisi" });
    }

    const newQuiz = {
      id: Date.now(),
      question,
      options,
      answer,
      dialect,
      bab,
    };

    data.push(newQuiz);
    writeJSON(quizPath, data);

    res.json({ message: "Soal kuis berhasil ditambah", data: newQuiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambah soal kuis" });
  }
};

exports.updateQuiz = (req, res) => {
  try {
    const data = readJSON(quizPath);
    const id = Number(req.params.id);
    const index = data.findIndex((q) => q.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Soal kuis tidak ditemukan" });
    }

    const { question, options, answer, dialect, bab } = req.body;

    if (question !== undefined) data[index].question = question;
    if (options !== undefined) data[index].options = options;
    if (answer !== undefined) data[index].answer = answer;
    if (dialect !== undefined) data[index].dialect = dialect;
    if (bab !== undefined) data[index].bab = bab;

    writeJSON(quizPath, data);

    res.json({ message: "Soal kuis berhasil diupdate", data: data[index] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengupdate soal kuis" });
  }
};

exports.deleteQuiz = (req, res) => {
  try {
    const data = readJSON(quizPath);
    const id = Number(req.params.id);
    const index = data.findIndex((q) => q.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Soal kuis tidak ditemukan" });
    }

    const deleted = data.splice(index, 1);
    writeJSON(quizPath, data);

    res.json({ message: "Soal kuis berhasil dihapus", data: deleted[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus soal kuis" });
  }
};

// ============================================
// 👥 USER MANAGEMENT
// ============================================
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = "SELECT id, name, username, role, is_blocked, created_at, last_login FROM users WHERE role != 'admin'";
    const params = [];

    if (role) {
      query += " AND role = ?";
      params.push(role);
    }

    if (search) {
      query += " AND (name LIKE ? OR username LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY created_at DESC";

    const [users] = await db.promise().query(query, params);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil daftar pengguna" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [users] = await db
      .promise()
      .query(
        "SELECT id, name, username, role, is_blocked, created_at, last_login FROM users WHERE id = ?",
        [req.params.id]
      );

    if (users.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data pengguna" });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Jangan bisa blokir admin
    const [users] = await db
      .promise()
      .query("SELECT role, is_blocked FROM users WHERE id = ?", [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    if (users[0].role === "admin") {
      return res.status(403).json({ message: "Tidak dapat memblokir admin" });
    }

    const newStatus = users[0].is_blocked ? 0 : 1;

    await db
      .promise()
      .query("UPDATE users SET is_blocked = ? WHERE id = ?", [
        newStatus,
        userId,
      ]);

    res.json({
      message: newStatus
        ? "Pengguna berhasil diblokir"
        : "Pengguna berhasil di-unblokir",
      is_blocked: newStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengubah status pengguna" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Jangan bisa hapus admin
    const [users] = await db
      .promise()
      .query("SELECT role FROM users WHERE id = ?", [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    if (users[0].role === "admin") {
      return res.status(403).json({ message: "Tidak dapat menghapus admin" });
    }

    await db.promise().query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ message: "Pengguna berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus pengguna" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    if (!["siswa", "guru"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role hanya boleh 'siswa' atau 'guru'" });
    }

    // Cek username unik
    const [existing] = await db
      .promise()
      .query("SELECT id FROM users WHERE username = ?", [username]);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db
      .promise()
      .query(
        "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
        [name, username, hashedPassword, role]
      );

    res.json({
      message: "Pengguna berhasil ditambahkan",
      userId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan pengguna" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, username, role } = req.body;

    // Cek user ada
    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE id = ?", [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    if (users[0].role === "admin") {
      return res.status(403).json({ message: "Tidak dapat mengedit admin" });
    }

    // Cek username unik jika berubah
    if (username && username !== users[0].username) {
      const [dup] = await db
        .promise()
        .query("SELECT id FROM users WHERE username = ? AND id != ?", [
          username,
          userId,
        ]);

      if (dup.length > 0) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
    }

    // Validasi role
    if (role && !["siswa", "guru"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role hanya boleh 'siswa' atau 'guru'" });
    }

    const updates = [];
    const params = [];

    if (name) {
      updates.push("name = ?");
      params.push(name);
    }
    if (username) {
      updates.push("username = ?");
      params.push(username);
    }
    if (role) {
      updates.push("role = ?");
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Tidak ada data yang diubah" });
    }

    params.push(userId);
    await db
      .promise()
      .query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);

    res.json({ message: "Pengguna berhasil diupdate" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengupdate pengguna" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res
        .status(400)
        .json({ message: "Password baru minimal 4 karakter" });
    }

    const [users] = await db
      .promise()
      .query("SELECT role FROM users WHERE id = ?", [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    if (users[0].role === "admin") {
      return res
        .status(403)
        .json({ message: "Tidak dapat mereset password admin" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .promise()
      .query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);

    res.json({ message: "Password berhasil direset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mereset password" });
  }
};

// ============================================
// 🏠 MODERASI ROOM
// ============================================
exports.getAllRooms = async (req, res) => {
  try {
    const [rooms] = await db.promise().query(`
      SELECT r.*,
        (SELECT COUNT(*) FROM room_questions WHERE room_id = r.id) AS total_questions,
        (SELECT COUNT(*) FROM room_attempts WHERE room_id = r.id) AS total_attempts
      FROM rooms r
      ORDER BY r.id DESC
    `);

    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil daftar room" });
  }
};

exports.getRoomDetail = async (req, res) => {
  try {
    const roomId = req.params.id;

    const [rooms] = await db
      .promise()
      .query("SELECT * FROM rooms WHERE id = ?", [roomId]);

    if (rooms.length === 0) {
      return res.status(404).json({ message: "Room tidak ditemukan" });
    }

    const room = rooms[0];

    const [questions] = await db
      .promise()
      .query("SELECT * FROM room_questions WHERE room_id = ?", [roomId]);

    const [attempts] = await db.promise().query(
      `SELECT ra.id, ra.score, ra.total, ra.created_at, u.name AS student_name
       FROM room_attempts ra
       JOIN users u ON ra.user_id = u.id
       WHERE ra.room_id = ?
       ORDER BY ra.created_at DESC`,
      [roomId]
    );

    room.questions = questions;
    room.attempts = attempts;

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil detail room" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;

    const [rooms] = await db
      .promise()
      .query("SELECT * FROM rooms WHERE id = ?", [roomId]);

    if (rooms.length === 0) {
      return res.status(404).json({ message: "Room tidak ditemukan" });
    }

    // CASCADE akan menghapus questions, options, blocks, attempts
    await db.promise().query("DELETE FROM rooms WHERE id = ?", [roomId]);

    res.json({ message: "Room berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus room" });
  }
};
