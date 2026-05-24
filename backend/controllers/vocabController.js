const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

// 🔥 TRANSLATE SENTENCE DENGAN GEMINI AI
exports.translateSentence = async (req, res) => {
  try {
    const { text, sourceLang, targetLang, dialect } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "Teks tidak boleh kosong" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "API Key Gemini belum dikonfigurasi di server." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    
    let prompt = "";
    const selectedDialect = dialect || "Ledo";
    
    if (sourceLang === "indo" && targetLang === "kaili") {
      prompt = `Anda adalah ahli bahasa daerah Kaili (dialek ${selectedDialect}). Terjemahkan kalimat bahasa Indonesia berikut ke dalam bahasa Kaili dialek ${selectedDialect}. HANYA berikan teks hasil terjemahannya saja tanpa penjelasan apapun, tanpa tanda kutip.\n\nTeks: ${text}`;
    } else if (sourceLang === "kaili" && targetLang === "indo") {
      prompt = `Anda adalah ahli bahasa daerah Kaili (dialek ${selectedDialect}). Terjemahkan kalimat bahasa Kaili dialek ${selectedDialect} berikut ke dalam bahasa Indonesia. HANYA berikan teks hasil terjemahannya saja tanpa penjelasan apapun, tanpa tanda kutip.\n\nTeks: ${text}`;
    } else {
      return res.status(400).json({ message: "Kombinasi bahasa tidak didukung" });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    res.json({ translation: translatedText });
  } catch (error) {
    console.error("Error Gemini translation:", error);
    res.status(500).json({ message: "Gagal menerjemahkan kalimat. Pastikan API Key valid atau coba lagi nanti." });
  }
};
