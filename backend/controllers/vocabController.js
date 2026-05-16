const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/vocab.json");
const validDialects = ["ledo", "rai"];

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
  const { q, mode = "indo", dialect, category } = req.query;

  if (dialect && !validDialects.includes(dialect.toLowerCase())) {
    return res.status(400).json({ message: "Dialek tidak tersedia" });
  }

  const data = JSON.parse(fs.readFileSync(filePath));

  if (!q) return res.json([]);

  const keywords = q
    .toLowerCase()
    .trim()
    .split(" ")
    .filter((k) => k.length > 0);

  let result = data.filter((item) => {

    // =========================
    // 🔥 MODE INDONESIA
    // =========================
    if (mode === "indo") {
      const words = item.indonesia
        .toLowerCase()
        .split(";")
        .map((w) => w.trim());

      // 🔥 hitung jumlah kata cocok
      const matchCount = keywords.filter((k) =>
        words.includes(k)
      ).length;

      // 🔥 minimal 1 cocok (kalau cuma 1 kata)
      // 🔥 atau minimal setengah cocok (kalau kalimat)
      return keywords.length === 1
        ? matchCount === 1
        : matchCount >= Math.ceil(keywords.length / 2);
    }

    // =========================
    // 🔥 MODE KAILI
    // =========================
    if (mode === "kaili") {
      return item.translations?.some((t) => {
        const word = t.word?.toLowerCase().trim();

        const matchCount = keywords.filter((k) =>
          word === k
        ).length;

        return keywords.length === 1
          ? matchCount === 1
          : matchCount >= Math.ceil(keywords.length / 2);
      });
    }

    return false;
  });

  // 🔥 TAMBAH INFO MATCH (KAILI)
  if (mode === "kaili") {
    result = result.map((item) => {
      const match = item.translations.find((t) =>
        keywords.includes(t.word.toLowerCase().trim())
      );

      return {
        ...item,
        matchedWord: match?.word,
        matchedDialect: match?.dialect,
      };
    });
  }

  // 🔥 FILTER DIALEK
  if (dialect) {
    result = result.filter((item) =>
      item.translations?.some(
        (t) =>
          t.dialect?.toLowerCase().trim() ===
          dialect.toLowerCase().trim()
      )
    );
  }

  // 🔥 FILTER CATEGORY
  if (category) {
    result = result.filter(
      (item) =>
        item.category?.toLowerCase().trim() ===
        category.toLowerCase().trim()
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
