const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("../config/db");

// ============================================
// 📂 FILE PATHS
// ============================================
const vocabPath = path.join(__dirname, "../data/vocab1.json");
const quizPath = path.join(__dirname, "../data/quiz.json");
const lessonDir = path.join(__dirname, "../data/lesson");
const practiceDir = path.join(__dirname, "../data/practice");
const levelMapPath = path.join(__dirname, "../../frontend/src/data/levelMap.js");

const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf-8"));
const writeJSON = (filePath, data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

const validDialects = ["ledo", "rai"];

const countJsonItemsInDir = (baseDir) => {
  let files = 0;
  let items = 0;

  validDialects.forEach((dialect) => {
    const dialectDir = path.join(baseDir, dialect);
    if (!fs.existsSync(dialectDir)) return;

    fs.readdirSync(dialectDir)
      .filter((file) => file.endsWith(".json"))
      .forEach((file) => {
        files += 1;
        const content = readJSON(path.join(dialectDir, file));
        if (Array.isArray(content)) items += content.length;
      });
  });

  return { files, items };
};

const cleanupRemovedBabData = (activeBabKeys) => {
  const activeKeySet = new Set(activeBabKeys.map((key) => key.toLowerCase()));

  [lessonDir, practiceDir].forEach((baseDir) => {
    validDialects.forEach((dialect) => {
      const dialectDir = path.join(baseDir, dialect);
      if (!fs.existsSync(dialectDir)) return;

      fs.readdirSync(dialectDir)
        .filter((file) => file.toLowerCase().endsWith(".json"))
        .forEach((file) => {
          const babKey = path.basename(file, ".json").toLowerCase();
          if (!activeKeySet.has(babKey)) {
            fs.unlinkSync(path.join(dialectDir, file));
          }
        });
    });
  });

  if (fs.existsSync(quizPath)) {
    const quizItems = readJSON(quizPath);
    if (Array.isArray(quizItems)) {
      const activeQuizItems = quizItems.filter((item) => {
        if (!item?.bab) return true;
        return activeKeySet.has(String(item.bab).toLowerCase());
      });

      if (activeQuizItems.length !== quizItems.length) {
        writeJSON(quizPath, activeQuizItems);
      }
    }
  }
};

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

const ensureStudentData = async (userId) => {
  await db
    .promise()
    .query(
      "INSERT IGNORE INTO student_profiles (user_id, dialect, title) VALUES (?, ?, ?)",
      [userId, "ledo", "Pemula"]
    );

  const progressRows = validDialects.map((dialect) => [
    userId,
    dialect,
    defaultProgressString(),
  ]);

  await db
    .promise()
    .query(
      "INSERT IGNORE INTO student_progress (user_id, dialect, progress) VALUES ?",
      [progressRows]
    );
};

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
    const [activeToday] = await db
      .promise()
      .query("SELECT COUNT(*) as count FROM users WHERE role != 'admin' AND last_login = CURDATE()");
    const [activeWeek] = await db
      .promise()
      .query("SELECT COUNT(*) as count FROM users WHERE role != 'admin' AND last_login >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
    const [attemptStats] = await db.promise().query(`
      SELECT
        COUNT(*) AS totalAttempts,
        COALESCE(ROUND(AVG(score / NULLIF(total, 0)) * 100), 0) AS averageScore
      FROM room_attempts
    `);
    const [xpStats] = await db
      .promise()
      .query("SELECT COALESCE(SUM(xp), 0) AS totalXp, COALESCE(ROUND(AVG(level), 1), 0) AS averageLevel FROM student_profiles");
    const [activeTrendRows] = await db.promise().query(`
      SELECT DATE_FORMAT(last_login, '%Y-%m-%d') AS date, COUNT(*) AS count
      FROM users
      WHERE role != 'admin'
        AND last_login >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY last_login
    `);
    const [attemptTrendRows] = await db.promise().query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date, COUNT(*) AS count
      FROM room_attempts
      WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
    `);

    const vocab = readJSON(vocabPath);
    const quiz = readJSON(quizPath);
    const lessons = countJsonItemsInDir(lessonDir);
    const practices = countJsonItemsInDir(practiceDir);
    const activeTrendMap = Object.fromEntries(
      activeTrendRows.map((row) => [row.date, row.count])
    );
    const attemptTrendMap = Object.fromEntries(
      attemptTrendRows.map((row) => [row.date, row.count])
    );
    const usageTrend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);

      return {
        date: key,
        activeUsers: activeTrendMap[key] || 0,
        roomAttempts: attemptTrendMap[key] || 0,
      };
    });

    const stats = {
      totalSiswa: 0,
      totalGuru: 0,
      totalVocab: vocab.length,
      totalQuiz: quiz.length,
      totalRooms: rooms[0].count,
      totalLessonFiles: lessons.files,
      totalLessonItems: lessons.items,
      totalPracticeFiles: practices.files,
      totalPracticeItems: practices.items,
      activeToday: activeToday[0].count,
      activeWeek: activeWeek[0].count,
      totalAttempts: attemptStats[0].totalAttempts,
      averageScore: attemptStats[0].averageScore,
      totalXp: xpStats[0].totalXp,
      averageLevel: xpStats[0].averageLevel,
      usageTrend,
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

exports.updateBabs = (req, res) => {
  try {
    const { babs } = req.body;

    if (!Array.isArray(babs)) {
      return res.status(400).json({ message: "Data bab tidak valid" });
    }

    const normalizedBabs = babs.map((bab) => {
      if (!bab?.key || !bab?.title) {
        throw new Error("Setiap bab wajib memiliki key dan title");
      }

      return {
        key: String(bab.key),
        label: String(bab.label || bab.key.toUpperCase()),
        title: String(bab.title),
        description: String(bab.description || ""),
        color: String(bab.color || "green"),
        levels: Array.isArray(bab.levels) ? bab.levels : [],
      };
    });

    const babList = normalizedBabs.map(({ levels, ...bab }) => bab);
    const levelMap = normalizedBabs.reduce((result, bab) => {
      result[bab.key] = bab.levels
        .map((level) => ({
          key: String(level.key || ""),
          title: String(level.title || ""),
          description: String(level.description || ""),
          keywords: Array.isArray(level.keywords) ? level.keywords : [],
        }))
        .filter((level) => level.key && level.title);

      return result;
    }, {});

    const content = `export const babList = ${JSON.stringify(babList, null, 2)};

export const levelMap = ${JSON.stringify(levelMap, null, 2)};

export const getBab = (babKey) => babList.find((bab) => bab.key === babKey);

export const getLevels = (babKey) => levelMap[babKey] || [];

export const getLevel = (babKey, levelKey) =>
  getLevels(babKey).find((level) => level.key === levelKey);

export const filterByLevel = (items, babKey, levelKey) => {
  const level = getLevel(babKey, levelKey);

  if (!level || !Array.isArray(items)) return items;

  if (["bab1", "bab2", "bab3"].includes(babKey)) {
    const targetCategory = level.title.toLowerCase();
    return items.filter(
      (item) => item.category && item.category.toLowerCase() === targetCategory
    );
  }

  const keywords = (level.keywords || []).map((keyword) => keyword.toLowerCase());
  const matched = items.filter((item) => {
    const searchable = [
      item.indo,
      item.indonesia,
      item.kaili,
      item.tipe,
      item.category,
      item.question,
      item.answer,
      ...(item.options || []),
      ...(item.blocks || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return keywords.some((keyword) => searchable.includes(keyword));
  });

  return matched.length > 0 ? matched : items;
};
`;

    fs.writeFileSync(levelMapPath, content, "utf-8");
    cleanupRemovedBabData(babList.map((bab) => bab.key));

    normalizedBabs.forEach((bab) => {
      validDialects.forEach((dialect) => {
        const lessonDialectDir = path.join(lessonDir, dialect);
        const practiceDialectDir = path.join(practiceDir, dialect);
        if (!fs.existsSync(lessonDialectDir)) fs.mkdirSync(lessonDialectDir, { recursive: true });
        if (!fs.existsSync(practiceDialectDir)) fs.mkdirSync(practiceDialectDir, { recursive: true });

        const lessonFile = path.join(lessonDialectDir, `${bab.key}.json`);
        const practiceFile = path.join(practiceDialectDir, `${bab.key}.json`);
        if (!fs.existsSync(lessonFile)) writeJSON(lessonFile, []);
        if (!fs.existsSync(practiceFile)) writeJSON(practiceFile, []);
      });
    });

    res.json({ message: "Daftar bab berhasil disimpan", babs: babList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Gagal menyimpan daftar bab" });
  }
};

// ============================================
// 📝 CRUD KUIS (quiz.json)
// ============================================
exports.getPractices = (req, res) => {
  try {
    const practices = [];

    validDialects.forEach((dialect) => {
      const dialectDir = path.join(practiceDir, dialect);
      if (!fs.existsSync(dialectDir)) return;

      const files = fs.readdirSync(dialectDir).filter((file) => file.endsWith(".json"));
      files.forEach((file) => {
        const bab = file.replace(".json", "");
        const content = readJSON(path.join(dialectDir, file));
        practices.push({
          dialect,
          bab,
          title: bab,
          totalItems: Array.isArray(content) ? content.length : 0,
          hasContent: true,
        });
      });
    });

    res.json(practices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membaca daftar latihan" });
  }
};

exports.getPractice = (req, res) => {
  try {
    const { dialect, bab } = req.params;
    const filePath = path.join(practiceDir, dialect, `${bab}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Latihan tidak ditemukan" });
    }

    res.json(readJSON(filePath));
  } catch (err) {
    res.status(500).json({ message: "Gagal membaca latihan" });
  }
};

exports.updatePractice = (req, res) => {
  try {
    const { dialect, bab } = req.params;
    const dialectDir = path.join(practiceDir, dialect);
    const items = Array.isArray(req.body) ? req.body : [];

    if (!fs.existsSync(dialectDir)) {
      fs.mkdirSync(dialectDir, { recursive: true });
    }

    writeJSON(path.join(dialectDir, `${bab}.json`), items);
    res.json({ message: "Latihan berhasil disimpan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan latihan" });
  }
};

exports.deletePractice = (req, res) => {
  try {
    const { dialect, bab } = req.params;
    const filePath = path.join(practiceDir, dialect, `${bab}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Latihan tidak ditemukan" });
    }

    fs.unlinkSync(filePath);
    res.json({ message: "Latihan berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus latihan" });
  }
};

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
    const { type, answerType, question, options, blocks, answer, image, dialect, bab, category } = req.body;

    if (!question || answer === undefined || !dialect || !bab) {
      return res.status(400).json({ message: "Semua field kuis wajib diisi" });
    }

    const newQuiz = {
      id: Date.now(),
      type: type || "multiple",
      answerType: answerType || "pilihan",
      question,
      options: Array.isArray(options) ? options : [],
      blocks: Array.isArray(blocks) ? blocks : [],
      answer,
      image: image || "",
      dialect,
      bab,
      category: category || "",
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

    const { type, answerType, question, options, blocks, answer, image, dialect, bab, category } = req.body;

    if (type !== undefined) data[index].type = type;
    if (answerType !== undefined) data[index].answerType = answerType;
    if (question !== undefined) data[index].question = question;
    if (options !== undefined) data[index].options = Array.isArray(options) ? options : [];
    if (blocks !== undefined) data[index].blocks = Array.isArray(blocks) ? blocks : [];
    if (answer !== undefined) data[index].answer = answer;
    if (image !== undefined) data[index].image = image;
    if (dialect !== undefined) data[index].dialect = dialect;
    if (bab !== undefined) data[index].bab = bab;
    if (category !== undefined) data[index].category = category;

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

exports.reorderQuiz = (req, res) => {
  try {
    const { quiz } = req.body;

    if (!Array.isArray(quiz)) {
      return res.status(400).json({ message: "Data urutan kuis tidak valid" });
    }

    writeJSON(quizPath, quiz);
    res.json({ message: "Urutan kuis berhasil disimpan", total: quiz.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan urutan kuis" });
  }
};

// ============================================
// 👥 USER MANAGEMENT
// ============================================
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = `SELECT u.id, u.name, u.username, u.role, u.is_blocked, u.created_at, u.last_login,
      sp.xp, sp.level, sp.title, sp.streak, sp.dialect
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role != 'admin'`;
    const params = [];

    if (role) {
      query += " AND u.role = ?";
      params.push(role);
    }

    if (search) {
      query += " AND (u.name LIKE ? OR u.username LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY u.created_at DESC";

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
        `SELECT u.id, u.name, u.username, u.role, u.is_blocked, u.created_at, u.last_login,
          sp.xp, sp.level, sp.title, sp.streak, sp.dialect
         FROM users u
         LEFT JOIN student_profiles sp ON u.id = sp.user_id
         WHERE u.id = ?`,
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

    if (role === "siswa") {
      await ensureStudentData(result.insertId);
    }

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

    if (role === "siswa") {
      await ensureStudentData(userId);
    }

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
