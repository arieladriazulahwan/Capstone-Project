const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign({ id: user.id }, "SECRET_KEY", {
      expiresIn: "1d",
    });

    res.json({
      message: "Login berhasil",
      token,
      user: { id: user.id, email: user.email },
    });
  });
};

// REGISTER
exports.register = (req, res) => {
  const { email, password } = req.body;

  // cek user sudah ada atau belum
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert ke database
    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({ message: "Register berhasil" });
      }
    );
  });
};