const db = require("../config/db");

const fs = require("fs");
const path = require("path");

const vocabPath = path.join(__dirname, "../data/vocab.json");

// ➕ TAMBAH FAVORIT
exports.addFavorite = (req, res) => {
  const userId = req.user.id;
  const { vocabId } = req.body;

  // 🔍 cek dulu
  db.query(
    "SELECT * FROM favorites WHERE user_id=? AND vocab_id=?",
    [userId, vocabId],
    (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length > 0) {
        return res.json({ message: "Sudah ada di favorit ❤️" });
      }

      // ➕ insert kalau belum ada
      db.query(
        "INSERT INTO favorites (user_id, vocab_id) VALUES (?, ?)",
        [userId, vocabId],
        (err) => {
          if (err) return res.status(500).json(err);
          res.json({ message: "Ditambahkan ke favorit ❤️" });
        }
      );
    }
  );
};

// ❌ HAPUS FAVORIT
exports.removeFavorite = (req, res) => {
  const userId = req.user.id;
  const { vocabId } = req.body;

  db.query(
    "DELETE FROM favorites WHERE user_id=? AND vocab_id=?",
    [userId, vocabId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Dihapus dari favorit 💔" });
    }
  );
};

// 📥 GET FAVORIT
exports.getFavorites = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT vocab_id FROM favorites WHERE user_id=?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json(err);

      res.json(results); // 🔥 ini yang dipakai Kamus.jsx
    }
  );
};

exports.getFavoritesFull = (req, res) => {
  const userId = req.user.id;

  // 1️⃣ ambil id favorit dari DB
  db.query(
    "SELECT vocab_id FROM favorites WHERE user_id=? ORDER BY id DESC",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json(err);

      const favIds = results.map((r) => r.vocab_id);

      // 2️⃣ ambil data vocab dari JSON
      const vocabData = JSON.parse(fs.readFileSync(vocabPath));

      // 3️⃣ filter sesuai favorit
      const favorites = vocabData.filter((v) =>
        favIds.includes(v.id)
      );

      // 4️⃣ urutkan sesuai urutan DB
      const sorted = favIds
        .map((id) => favorites.find((v) => v.id === id))
        .filter(Boolean);

      res.json(sorted);
    }
  );
};