const db = require("../config/db");

const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const vocabPath = path.join(__dirname, "../data/vocab1.json");

// ➕ TAMBAH FAVORIT
exports.addFavorite = (req, res) => {
  const userId = req.user.id;
  const vocabId = Number(req.body.vocabId);

  if (!Number.isInteger(vocabId) || vocabId <= 0) {
    return res.status(400).json({ message: "Vocab tidak valid" });
  }

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
  const vocabId = Number(req.body.vocabId);

  if (!Number.isInteger(vocabId) || vocabId <= 0) {
    return res.status(400).json({ message: "Vocab tidak valid" });
  }

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

exports.getFavoritesFull = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1️⃣ ambil id favorit dari DB
    const [results] = await db.promise().query(
      "SELECT vocab_id FROM favorites WHERE user_id=? ORDER BY id DESC",
      [userId]
    );

    const favIds = results.map((r) => r.vocab_id);

    // 2️⃣ ambil data vocab dari JSON
    const rawData = await fsPromises.readFile(vocabPath, "utf-8");
    const vocabData = JSON.parse(rawData);

    // 3️⃣ filter sesuai favorit
    const favorites = vocabData.filter((v) =>
      favIds.includes(v.id)
    );

    // 4️⃣ urutkan sesuai urutan DB
    const sorted = favIds
      .map((id) => favorites.find((v) => v.id === id))
      .filter(Boolean);

    res.json(sorted);
  } catch (err) {
    console.error("Favorite Error:", err);
    res.status(500).json({ message: "Gagal memuat favorit", error: err.message || err });
  }
};
