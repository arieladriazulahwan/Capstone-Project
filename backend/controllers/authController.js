const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔥 helper tanggal (ANTI BUG TIMEZONE)
const getToday = () => new Date().toLocaleDateString("en-CA");

const formatLocalDate = (date) => {
  return date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Makassar",
  });
};

const defaultProgressObject = () => ({ bab1: true, bab2: false, bab3: false });
const defaultProgressString = () => JSON.stringify(defaultProgressObject());

const parseProgress = (raw) => {
  if (!raw) return defaultProgressObject();
  try {
    return JSON.parse(raw);
  } catch {
    return defaultProgressObject();
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
      if (results.length === 0) return callback(null, null);
      callback(null, results[0].dialect);
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

const updateProgressByBab = (progress, bab) => {
  if (bab === "bab1") {
    progress.bab1 = true;
    progress.bab2 = true;
  }
  if (bab === "bab2") {
    progress.bab2 = true;
    progress.bab3 = true;
  }
  if (bab === "bab3") {
    progress.bab3 = true;
  }
  return progress;
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  const { name, username, password, role } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "siswa";

    db.query(
      "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
      [name, username, hashedPassword, userRole],
      (err, result) => {
        if (err) return res.status(500).json(err);

        const userId = result.insertId;
        if (userRole === "siswa") {
          const dialect = "ledo";
          const allDialects = ["ledo", "rai", "doi"];
          const progressRows = allDialects.map((d) => [userId, d, defaultProgressString()]);

          db.query(
            "INSERT INTO student_profiles (user_id, dialect, title) VALUES (?, ?, ?)",
            [userId, dialect, "Pemula"],
            (err) => {
              if (err) return res.status(500).json(err);

              db.query(
                "INSERT IGNORE INTO student_progress (user_id, dialect, progress) VALUES ?",
                [progressRows],
                (err) => {
                  if (err) return res.status(500).json(err);
                  res.json({ message: "Register berhasil" });
                }
              );
            }
          );
        } else {
          res.json({ message: "Register berhasil" });
        }
      }
    );
  });
};

// ================= LOGIN =================
exports.login = (req, res) => {
  const { username, password, role } = req.body;

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: "Role tidak sesuai" });
    }

    db.query(
      "SELECT u.last_login, sp.streak FROM users u LEFT JOIN student_profiles sp ON u.id = sp.user_id WHERE u.id = ?",
      [user.id],
      (err, result) => {
        if (err) return res.status(500).json(err);

        let streak = result[0]?.streak || 0;
        let lastLoginRaw = result[0]?.last_login;
        const today = formatLocalDate(new Date());

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = formatLocalDate(yesterdayDate);

        let lastLogin = null;
        if (lastLoginRaw) {
          lastLogin = formatLocalDate(new Date(lastLoginRaw));
        }

        if (!lastLogin) {
          streak = 1;
        } else if (lastLogin === yesterday) {
          streak += 1;
        } else if (lastLogin === today) {
          streak = streak;
        } else {
          streak = 1;
        }

        updateUserLastLogin(user.id, today, (updateErr) => {
          if (updateErr) console.log("Gagal update last_login");

          const finalizeResponse = () => {
            const token = jwt.sign({ id: user.id, role: user.role }, "SECRET_KEY", { expiresIn: "1d" });
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
          };

          if (user.role === "siswa") {
            db.query(
              "UPDATE student_profiles SET streak = ? WHERE user_id = ?",
              [streak, user.id],
              (err) => {
                if (err) console.log("Gagal update streak");
                finalizeResponse();
              }
            );
          } else {
            finalizeResponse();
          }
        });
      }
    );
  });
};

// ================= PROFILE =================
exports.getProfile = (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT u.id, u.name, u.username, u.role, u.created_at, u.last_login,
      sp.xp, sp.level, sp.title, sp.streak, sp.dialect
    FROM users u
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    WHERE u.id = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

      const profile = results[0];
      const currentDialect = profile.dialect || "ledo";

      db.query(
        "SELECT dialect, progress FROM student_progress WHERE user_id = ?",
        [userId],
        (err, progressRows) => {
          if (err) return res.status(500).json(err);

          const progressByDialect = {};
          progressRows.forEach((row) => {
            progressByDialect[row.dialect] = parseProgress(row.progress);
          });

          const progress = progressByDialect[currentDialect] || defaultProgressObject();

          res.json({
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
          });
        }
      );
    }
  );
};

// ================= ADD XP =================
exports.addXP = (req, res) => {
  const userId = req.user.id;
  const { xp } = req.body;

  if (xp === undefined || xp === null) {
    return res.status(400).json({ message: "XP kosong" });
  }

  db.query(
    "SELECT xp, level FROM student_profiles WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0) {
        return res.status(400).json({ message: "Hanya siswa yang bisa menambah XP" });
      }

      let currentXP = results[0].xp || 0;
      let level = results[0].level || 1;
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

const updateStudentProgress = (userId, bab, res) => {
  getStudentDialect(userId, (err, dialect) => {
    if (err) return res.status(500).json(err);
    if (!dialect) return res.status(400).json({ message: "Profil siswa tidak ditemukan" });

    getStudentProgress(userId, dialect, (err, rawProgress) => {
      if (err) return res.status(500).json(err);

      const progress = updateProgressByBab(parseProgress(rawProgress), bab);

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
  const { bab } = req.body;
  const validBab = ["bab1", "bab2", "bab3"];
  if (!bab || !validBab.includes(bab)) {
    return res.status(400).json({ message: "Bab tidak valid" });
  }
  updateStudentProgress(req.user.id, bab, res);
};

exports.updateDialect = (req, res) => {
  const userId = req.user.id;
  const { dialect } = req.body;

  if (!dialect) {
    return res.status(400).json({ message: "Dialek wajib diisi" });
  }

  db.query("SELECT role FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });
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

// ================= LOGOUT =================
exports.logout = (req, res) => {
  res.json({ message: "Logout berhasil" });
};

