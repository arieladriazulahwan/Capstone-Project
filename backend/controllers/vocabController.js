const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/vocab.json");

// 🔥 GET ALL
exports.getAllVocab = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
};

// 🔥 GET BY ID
exports.getVocabById = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const vocab = data.find((v) => v.id == req.params.id);

  if (!vocab) {
    return res.status(404).json({ message: "Tidak ditemukan" });
  }

  res.json(vocab);
};

// 🔥 SEARCH
exports.searchVocab = (req, res) => {
  const { q, mode, dialect, category } = req.query;

  const data = JSON.parse(fs.readFileSync(filePath));

  if (!q) return res.json([]);

  let result = [];

  data.forEach((item) => {
    // 🔥 MODE INDONESIA → KAILI
    if (mode === "indo") {
      if (item.indonesia.toLowerCase().includes(q.toLowerCase())) {
        result.push(item);
      }
    }

    // 🔥 MODE KAILI → INDONESIA
    if (mode === "kaili") {
      const match = item.translations.find((t) =>
        t.word.toLowerCase().includes(q.toLowerCase())
      );

      if (match) {
        result.push({
          ...item,
          matchedWord: match.word,
          matchedDialect: match.dialect,
        });
      }
    }
  });

  // 🔥 FILTER DIALEK
  if (dialect) {
    result = result.filter((item) =>
      item.translations?.some(
        (t) => t.dialect.toLowerCase() === dialect.toLowerCase()
      )
    );
  }

  // 🔥 FILTER CATEGORY
  if (category) {
    result = result.filter(
      (item) =>
        item.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.json(result);
};

// 🔥 TAMBAH DATA (OPSIONAL)
exports.addVocab = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));

  const newVocab = {
    id: Date.now(),
    ...req.body,
  };

  data.push(newVocab);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.json({ message: "Berhasil tambah vocab", data: newVocab });
};