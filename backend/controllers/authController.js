const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const today = new Date().toISOString().slice(0, 10);

// REGISTER
exports.register = async (req, res) => {
  const { name, username, password, role } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
      [name, username , hashedPassword, role || "siswa"],
      (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Register berhasil" });
      }
    );
  });
};

// LOGIN
exports.login = (req, res) => {
  const { username, password, role } = req.body;

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (results.length === 0) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const user = results[0]; // <--- Variabel user didefinisikan di sini

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: "Role tidak sesuai" });
    }

    // --- PINDAHKAN LOGIKA STREAK KE SINI ---
    db.query(
      "SELECT last_login, streak FROM users WHERE id = ?",
      [user.id],
      (err, result) => {
        if (err) return res.status(500).json(err);

        let streak = result[0].streak || 0;
        let lastLogin = result[0].last_login;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yDate = yesterday.toISOString().slice(0, 10);

        if (lastLogin === yDate) {
          streak += 1;
        } else if (lastLogin !== today) {
          streak = 1;
        }

        // Update streak di database
        db.query(
          "UPDATE users SET streak=?, last_login=? WHERE id=?",
          [streak, today, user.id],
          (updateErr) => {
            if (updateErr) console.log("Gagal update streak");

            // --- TOKEN DAN RESPONSE PINDAH KE DALAM CALLBACK AGAR TERUPDATE ---
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
                streak: streak // Tambahkan info streak di response jika perlu
              },
            });
          }
        );
      }
    );
    // --- AKHIR LOGIKA STREAK ---
  });
};

// PROFILE
exports.getProfile = (req, res) => {
  const userId = req.user.id;
  db.query("SELECT id, name, username, role, streak FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0]);
  });
};

// LOGOUT
exports.logout = (req, res) => {
  // Karena JWT stateless, logout bisa dilakukan di client dengan menghapus token
  res.json({ message: "Logout berhasil" });
};