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
  const { q } = req.query;
  const data = JSON.parse(fs.readFileSync(filePath));

  const result = data.filter((v) =>
    v.indonesia.toLowerCase().includes(q.toLowerCase())
  );

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