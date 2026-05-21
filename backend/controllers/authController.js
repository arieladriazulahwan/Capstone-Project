const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

// 🔥 helper tanggal (ANTI BUG TIMEZONE)
const getToday = () => new Date().toLocaleDateString("en-CA");

const formatLocalDate = (date) => {
  try {
    return date.toLocaleDateString("en-CA", {
      timeZone: "Asia/Makassar",
    });
  } catch (error) {
    // Fallback apabila env/NodeJS tidak men-support nama zona waktu tertentu
    return date.toLocaleDateString("en-CA");
  }
};

const totalBab = 10;
const validBab = Array.from({ length: totalBab }, (_, index) => `bab${index + 1}`);
const validLevelsByBab = {
  bab1: [
    "kata-benda",
    "kata-kerja",
    "kata-sifat",
    "kata-keterangan",
    "kata-ganti",
    "kata-depan",
    "kata-sambung",
    "kata-bilangan",
    "kata-seru",
    "kata-sandang",
  ],
  bab2: ["kalimat-sederhana"],
  bab3: ["gambar-kosakata"],
};

const defaultProgressObject = () =>
  validBab.reduce((progress, bab, index) => {
    progress[bab] = index === 0;
    progress.levels = progress.levels || {};
    progress.levels[bab] = {};

    const levels = validLevelsByBab[bab] || [];
    levels.forEach((level, levelIndex) => {
      // Level pertama dari bab pertama akan terbuka dengan skor 0
      if (index === 0 && levelIndex === 0) {
        progress.levels[bab][level] = 0;
      }
    });

    return progress;
  }, {});

const defaultProgressString = () => JSON.stringify(defaultProgressObject());
const validDialects = ["ledo", "rai"];

const parseProgress = (raw) => {
  const defaults = defaultProgressObject();
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) || {};
    const finalProgress = { ...defaults, ...parsed };
    finalProgress.levels = {};

    // Lakukan deep merge untuk memastikan semua level ada
    for (const babKey of validBab) {
      finalProgress.levels[babKey] = {
        ...(defaults.levels[babKey] || {}),
        ...(parsed.levels ? parsed.levels[babKey] || {} : {}),
      };
    }

    // Pastikan bab pertama dan level pertama selalu bisa diakses
    if (finalProgress.levels.bab1["kata-benda"] === undefined) {
      finalProgress.levels.bab1["kata-benda"] = 0;
    }
    if (finalProgress.bab1 === false) {
      finalProgress.bab1 = true;
    }

    return finalProgress;
  } catch (e) {
    console.error("Error parsing progress:", e);
    return defaults;
  }
};

const updateUserLastLogin = (userId, today, callback) => {
  db.query("UPDATE users SET last_login = ? WHERE id = ?", [today, userId], callback);
};

const getStudentDialect = (userId, callback) => {
  db.query(
    "SELECT dialect FROM student_profiles WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(null, "ledo");
      callback(null, results[0].dialect || "ledo");
    }
  );
};

const getStudentProgress = (userId, dialect, callback) => {
  db.query(
    "SELECT progress FROM student_progress WHERE user_id = ? AND dialect = ?",
    [userId, dialect],
    (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(null, null);
      callback(null, results[0].progress);
    }
  );
};

const saveStudentProgress = (userId, dialect, progress, callback) => {
  db.query(
    "INSERT INTO student_progress (user_id, dialect, progress) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE progress = VALUES(progress)",
    [userId, dialect, progress],
    callback
  );
};

const updateProgressByBab = (progress, bab, level, score, total) => {
  const updatedProgress = { ...progress };
  const babIndex = validBab.indexOf(bab);
  if (babIndex === -1) {
    return updatedProgress;
  }

  updatedProgress[bab] = true;
  updatedProgress.levels = updatedProgress.levels || {};
  updatedProgress.levels[bab] = updatedProgress.levels[bab] || {};

  const levels = validLevelsByBab[bab] || [];

  if (level && levels.includes(level)) {
    const percentage = Math.round((score / total) * 100);
    const currentScore = updatedProgress.levels[bab][level] || 0;

    // Update skor hanya jika lebih tinggi dari sebelumnya
    if (percentage > currentScore) {
      updatedProgress.levels[bab][level] = percentage;
    }

    // Buka level berikutnya jika skor >= 80%
    if (percentage >= 80) {
      const levelIndex = levels.indexOf(level);
      const nextLevelKey = levels[levelIndex + 1];

      if (nextLevelKey) {
        // Buka level selanjutnya di bab yang sama jika belum terbuka
        if (updatedProgress.levels[bab][nextLevelKey] === undefined) {
          updatedProgress.levels[bab][nextLevelKey] = 0;
        }
      } else {
        // Jika ini level terakhir, buka bab selanjutnya
        const nextBabKey = validBab[babIndex + 1];
        if (nextBabKey) {
          updatedProgress[nextBabKey] = true;
          const nextBabFirstLevelKey = validLevelsByBab[nextBabKey]?.[0];
          if (nextBabFirstLevelKey && updatedProgress.levels[nextBabKey][nextBabFirstLevelKey] === undefined) {
            updatedProgress.levels[nextBabKey] = updatedProgress.levels[nextBabKey] || {};
            updatedProgress.levels[nextBabKey][nextBabFirstLevelKey] = 0;
          }
        }
      }
    }
  }

  return updatedProgress;
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  const { name, username, password, role } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  try {
    const [results] = await db.promise().query("SELECT * FROM users WHERE username = ?", [username]);
    if (results.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan, silahkan cari username lain" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "siswa";

    const [insertResult] = await db.promise().query(
      "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
      [name, username, hashedPassword, userRole]
    );

    const userId = insertResult.insertId;

    if (userRole === "siswa") {
      const dialect = "ledo";
      const progressRows = validDialects.map((d) => [userId, d, defaultProgressString()]);

      await db.promise().query(
        "INSERT INTO student_profiles (user_id, dialect, title) VALUES (?, ?, ?)",
        [userId, dialect, "Pemula"]
      );

      await db.promise().query(
        "INSERT IGNORE INTO student_progress (user_id, dialect, progress) VALUES ?",
        [progressRows]
      );
    }

    res.json({ message: "Register berhasil" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: err.message || err });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi" });
  }

  try {
    const [results] = await db.promise().query("SELECT * FROM users WHERE username = ?", [username]);
    if (results.length === 0) {
      return res.status(400).json({ message: "username atau password salah" });
    }

    const user = results[0];

    let isMatch = false;
    if (!user.password) {
      return res.status(400).json({ message: "Akun tidak memiliki password, silahkan hubungi admin" });
    }

    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (compareErr) {
      console.error("Bcrypt Error:", compareErr);
      if (password === user.password) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(400).json({ message: "username atau password salah" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: "username atau password salah" });
    }

    let streak = 0;
    let lastLoginRaw = null;

    try {
      const [streakResult] = await db.promise().query(
        "SELECT u.last_login, sp.streak FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.id = ?",
        [user.id]
      );
      streak = streakResult[0]?.streak || 0;
      lastLoginRaw = streakResult[0]?.last_login;
    } catch (dbErr) {
      console.error("Database Error pada query streak:", dbErr);
    }

    const today = formatLocalDate(new Date());

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = formatLocalDate(yesterdayDate);

    let lastLogin = null;
    if (lastLoginRaw) {
      const parsedDate = new Date(lastLoginRaw);
      if (!isNaN(parsedDate.getTime())) {
        lastLogin = formatLocalDate(parsedDate);
      }
    }

    if (!lastLogin) {
      streak = 1;
    } else if (lastLogin === yesterday) {
      streak += 1;
    } else if (lastLogin === today) {
      // Tetap
    } else {
      streak = 1;
    }

    try {
      await db.promise().query("UPDATE users SET last_login = ? WHERE id = ?", [today, user.id]);
    } catch (updateErr) {
      console.error("Gagal update last_login", updateErr);
    }

    if (user.role === "siswa") {
      try {
        await db.promise().query("UPDATE student_profiles SET streak = ? WHERE user_id = ?", [streak, user.id]);
      } catch (streakErr) {
        console.error("Gagal update streak", streakErr);
      }
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    
    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        streak: user.role === "siswa" ? streak : 0,
      },
    });

  } catch (err) {
    console.error("Login Server Error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: err.message || err });
  }
};

// ================= PROFILE =================
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [users] = await db.promise().query(
      `SELECT u.id, u.name, u.username, u.role, u.created_at, u.last_login,
        sp.xp, sp.level, sp.title, sp.streak, sp.dialect
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const profile = users[0];
    const currentDialect = profile.dialect || "ledo";

    let progressByDialect = {};
    let progress = defaultProgressObject();

    try {
      const [progressRows] = await db.promise().query(
        "SELECT dialect, progress FROM student_progress WHERE user_id = ?",
        [userId]
      );
      progressRows.forEach((row) => {
        progressByDialect[row.dialect] = parseProgress(row.progress);
      });
      progress = progressByDialect[currentDialect] || defaultProgressObject();
    } catch (progErr) {
      console.error("Gagal mengambil progress:", progErr);
    }

    let stats = { total_quizzes: 0, total_points: 0 };
    try {
      const [statsRows] = await db.promise().query(
        `SELECT
          COUNT(*) AS total_quizzes,
          COALESCE(SUM(score), 0) AS total_points
        FROM room_attempts
        WHERE user_id = ?`,
        [userId]
      );
      if (statsRows.length > 0) {
        stats = statsRows[0] || stats;
      }
    } catch (statErr) {
      console.error("Gagal mengambil stats quiz:", statErr);
    }

    res.json({
      user: {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        role: profile.role,
        xp: profile.xp || 0,
        level: profile.level || 1,
        title: profile.title || "Pemula",
        streak: profile.streak || 0,
        dialect: currentDialect,
        progress,
        progressByDialect,
        total_quizzes: Number(stats.total_quizzes) || 0,
        total_points: Number(stats.total_points) || 0,
      }
    });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server saat memuat profil", error: err.message || err });
  }
};

// ================= ADD XP =================
exports.addXP = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const xp = Number(req.body.xp);

  if (!Number.isFinite(xp) || xp < 0) {
    return res.status(400).json({ message: "XP tidak valid" });
  }

  if (userRole && userRole !== "siswa") {
    return res.status(200).json({ message: "Hanya siswa yang bisa menambah XP", xp: 0, level: 1, title: "Guru" });
  }

  db.query(
    "SELECT xp, level FROM student_profiles WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0) {
        // 🔥 Auto-create profil jika akun siswa lama tidak memilikinya
        let newXP = xp;
        let level = 1;
        while (newXP >= 100) {
          newXP -= 100;
          level += 1;
        }
        let title = "Pemula 🌱";
        if (level >= 10) title = "Master 🏆";
        else if (level >= 5) title = "Ahli 🧠";
        else if (level >= 3) title = "Penjelajah 🧭";
        else if (level >= 2) title = "Pelajar 📘";

        db.query(
          "INSERT INTO student_profiles (user_id, dialect, xp, level, title) VALUES (?, 'ledo', ?, ?, ?)",
          [userId, newXP, level, title],
          (insertErr) => {
            if (insertErr) return res.status(500).json(insertErr);
            return res.json({ message: "Profil dipulihkan dan XP bertambah", xp: newXP, level, title });
          }
        );
        return;
      }

      let currentXP = results[0].xp || 0;
      let level = results[0].level || 1;

      // 🔥 Jika skor/XP yang didapat adalah 0
      if (xp === 0) {
        let title = "Pemula 🌱";
        if (level >= 10) title = "Master 🏆";
        else if (level >= 5) title = "Ahli 🧠";
        else if (level >= 3) title = "Penjelajah 🧭";
        else if (level >= 2) title = "Pelajar 📘";
        
        return res.json({
          message: "Belum ada tambahan poin, tetap semangat! 💪",
          xp: currentXP,
          level,
          title,
        });
      }

      let newXP = currentXP + xp;
      const oldLevel = level;

      while (newXP >= 100) {
        newXP -= 100;
        level += 1;
      }

      let title = "Pemula 🌱";
      if (level >= 10) title = "Master 🏆";
      else if (level >= 5) title = "Ahli 🧠";
      else if (level >= 3) title = "Penjelajah 🧭";
      else if (level >= 2) title = "Pelajar 📘";

      db.query(
        "UPDATE student_profiles SET xp = ?, level = ?, title = ? WHERE user_id = ?",
        [newXP, level, title, userId],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: level > oldLevel ? "LEVEL UP! 🎉" : "XP bertambah",
            xp: newXP,
            level,
            title,
          });
        }
      );
    }
  );
};

const updateStudentProgress = (userId, bab, res, level = null, score = null, total = null) => {
  getStudentDialect(userId, (err, dialect) => {
    if (err) return res.status(500).json(err);
    if (!dialect) return res.status(200).json({ message: "Profil siswa tidak ditemukan, progress diabaikan", progress: {} });

    getStudentProgress(userId, dialect, (err, rawProgress) => {
      if (err) return res.status(500).json(err);

      const progress = updateProgressByBab(parseProgress(rawProgress), bab, level, score, total);

      saveStudentProgress(userId, dialect, JSON.stringify(progress), (err) => {
        if (err) return res.status(500).json(err);

        res.json({ message: "Progress diperbarui", progress });
      });
    });
  });
};

exports.completeBab1 = (req, res) => {
  updateStudentProgress(req.user.id, "bab1", res);
};

exports.completeBab = (req, res) => {
  const { bab, level, score, total } = req.body;
  if (!bab || !validBab.includes(bab)) {
    return res.status(400).json({ message: "Bab tidak valid" });
  }

  if (level && !validLevelsByBab[bab]?.includes(level)) {
    return res.status(400).json({ message: "Level tidak valid" });
  }

  updateStudentProgress(req.user.id, bab, res, level, score, total);
};

exports.updateDialect = (req, res) => {
  const userId = req.user.id;
  const { dialect } = req.body;

  if (!dialect) {
    return res.status(400).json({ message: "Dialek wajib diisi" });
  }

  if (!validDialects.includes(dialect.toLowerCase())) {
    return res.status(400).json({ message: "Dialek tidak tersedia" });
  }

  db.query("SELECT role FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: "User atau password salah" });
    if (results[0].role !== "siswa") {
      return res.status(400).json({ message: "Hanya siswa yang dapat mengubah dialek" });
    }

    db.query(
      "UPDATE student_profiles SET dialect = ? WHERE user_id = ?",
      [dialect, userId],
      (err) => {
        if (err) return res.status(500).json(err);

        db.query(
          "INSERT IGNORE INTO student_progress (user_id, dialect, progress) VALUES (?, ?, ?)",
          [userId, dialect, defaultProgressString()],
          (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Dialek berhasil diubah", dialect });
          }
        );
      }
    );
  });
};

// ================= LEADERBOARD =================
exports.getLeaderboard = (req, res) => {
  db.query(
    `SELECT u.id, u.name, u.username, sp.xp, sp.level, sp.title
     FROM users u
     JOIN student_profiles sp ON u.id = sp.user_id
     WHERE u.role = 'siswa'
     ORDER BY sp.level DESC, sp.xp DESC
     LIMIT 10`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

// ================= LOGOUT =================
exports.logout = (req, res) => {
  res.json({ message: "Logout berhasil" });
};
