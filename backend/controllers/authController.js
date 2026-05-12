const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔥 helper tanggal (ANTI BUG TIMEZONE)
const getToday = () => new Date().toLocaleDateString("en-CA");

const formatLocalDate = (date) => {
  return date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Makassar", // bisa juga Asia/Jakarta
  });
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  const { name, username, password, role } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (results.length > 0) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const defaultProgress = JSON.stringify({
        bab1: true,
        bab2: false,
        bab3: false,
      });

      db.query(
        "INSERT INTO users (name, username, password, role, progress) VALUES (?, ?, ?, ?, ?)",
        [name, username, hashedPassword, role || "siswa", defaultProgress],
        (err) => {
          if (err) return res.status(500).json(err);
          res.json({ message: "Register berhasil" });
        }
      );
    }
  );
};

// ================= LOGIN =================
exports.login = (req, res) => {
  const { username, password, role } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
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

      // 🔥 STREAK FIX
      db.query(
        "SELECT last_login, streak FROM users WHERE id = ?",
        [user.id],
        (err, result) => {
          if (err) return res.status(500).json(err);

          let streak = result[0].streak || 0;
          let lastLoginRaw = result[0].last_login;

          const today = formatLocalDate(new Date());

          const yesterdayDate = new Date();
          yesterdayDate.setDate(yesterdayDate.getDate() - 1);
          const yesterday = formatLocalDate(yesterdayDate);

          // 🔥 FIX parsing DB (INI KUNCI UTAMA)
          let lastLogin = null;
          if (lastLoginRaw) {
            lastLogin = formatLocalDate(new Date(lastLoginRaw));
          }

          console.log("TODAY:", today);
          console.log("YESTERDAY:", yesterday);
          console.log("LAST LOGIN:", lastLogin);

          // 🔥 LOGIC FINAL
          if (!lastLogin) {
            streak = 1;
          } else if (lastLogin === yesterday) {
            streak += 1;
          } else if (lastLogin === today) {
            // login di hari yang sama → biarkan
            streak = streak;
          } else {
            streak = 1;
          }

          db.query(
            "UPDATE users SET streak=?, last_login=? WHERE id=?",
            [streak, today, user.id],
            (updateErr) => {
              if (updateErr) console.log("Gagal update streak");

              const token = jwt.sign(
                { id: user.id, role: user.role },
                "SECRET_KEY",
                { expiresIn: "1d" }
              );

              res.json({
                message: "Login berhasil",
                token,
                user: {
                  id: user.id,
                  name: user.name,
                  username: user.username,
                  role: user.role,
                  streak: streak,
                },
              });
            }
          );
        }
      );
    }
  );
};

// ================= PROFILE =================
exports.getProfile = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT id, name, username, role, xp, level, title, streak, progress, dialect FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json(err);

      let progress = {};

      try {
        progress = JSON.parse(results[0].progress || "{}");
      } catch {
        progress = {};
      }

      res.json({
        ...results[0],
        progress,
      });
    }
  );
};

// ================= ADD XP =================
exports.addXP = (req, res) => {
  const userId = req.user.id;
  const { xp } = req.body;

  if (xp === undefined || xp === null) {
    return res.status(400).json({
      message: "XP kosong",
    });
  }

  db.query(
    "SELECT xp, level FROM users WHERE id = ?",
    [userId],
    (err, results) => {

      if (err) {
        return res.status(500).json(err);
      }

      let currentXP = results[0].xp || 0;
      let level = results[0].level || 1;

      let newXP = currentXP + xp;
      let oldLevel = level;

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
        "UPDATE users SET xp=?, level=?, title=? WHERE id=?",
        [newXP, level, title, userId],
        (err) => {

          if (err) {
            return res.status(500).json(err);
          }

          res.json({
            message:
              level > oldLevel
                ? "LEVEL UP! 🎉"
                : "XP bertambah",

            xp: newXP,
            level,
            title,
          });
        }
      );
    }
  );
};
// ================= COMPLETE BAB 1 =================
exports.completeBab1 = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT progress FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json(err);

      let progress = JSON.parse(results[0].progress || "{}");

      progress.bab1 = true;
      progress.bab2 = true;

      db.query(
        "UPDATE users SET progress = ? WHERE id = ?",
        [JSON.stringify(progress), userId],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: "Progress diperbarui",
            progress,
          });
        }
      );
    }
  );
};

exports.updateDialect = (req, res) => {
  const userId = req.user.id;
  const { dialect } = req.body;

  if (!dialect) {
    return res.status(400).json({ message: "Dialek wajib diisi" });
  }

  db.query(
    "UPDATE users SET dialect=? WHERE id=?",
    [dialect, userId],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Dialek berhasil diubah", dialect });
    }
  );
};


// ================= LOGOUT =================
exports.logout = (req, res) => {
  res.json({ message: "Logout berhasil" });
};