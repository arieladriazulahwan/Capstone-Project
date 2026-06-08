const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/vocab1.json");
const validDialects = ["ledo", "rai"];

const descWords = [
  "yg",
  "yang",
  "dgn",
  "dengan",
  "seperti",
  "untuk",
  "dll",
  "dsb",
  "sbg",
  "yaitu",
  "misalnya",
  "biasanya",
  "terutama",
  "khususnya",
];

let indoToKailiMap = new Map();
let kailiToIndoMap = new Map();
let dictionaryLoaded = false;

const kailiPrefixes = [
  "nomba",
  "namba",
  "nompa",
  "nampa",
  "noka",
  "naka",
  "momba",
  "mamba",
  "mompa",
  "mampa",
  "nopo",
  "napo",
  "nang",
  "nom",
  "nap",
  "nak",
  "neng",
  "meng",
  "mang",
  "no",
  "na",
  "mo",
  "ma",
  "ne",
  "ni",
  "po",
  "pa",
  "pe",
  "to",
  "ro",
];

const readJsonFile = (targetPath) => {
  if (!fs.existsSync(targetPath)) return [];
  return JSON.parse(fs.readFileSync(targetPath, "utf-8"));
};

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const splitMeaningParts = (meaning = "") =>
  String(meaning)
    .split(/[;,]/)
    .map((part) => normalizeText(part))
    .filter((part) => {
      if (!part) return false;
      if (part.split(/\s+/).length > 5) return false;
      return !descWords.some(
        (word) => part.includes(` ${word} `) || part.startsWith(`${word} `)
      );
    });

const splitTranslationParts = (word = "") =>
  String(word)
    .split(/[;,]/)
    .map((part) => normalizeText(part))
    .filter(Boolean);

const isBetterTranslation = (nextValue, currentValue) => {
  if (!nextValue) return false;
  if (!currentValue) return true;

  const nextWordCount = nextValue.split(/\s+/).length;
  const currentWordCount = currentValue.split(/\s+/).length;

  if (nextWordCount < currentWordCount) return true;
  return nextWordCount === currentWordCount && nextValue.length < currentValue.length;
};

const addIndoEntry = (indoText, dialect, kailiText) => {
  if (!indoText || !dialect || !kailiText) return;

  const current = indoToKailiMap.get(indoText) || {};
  if (isBetterTranslation(kailiText, current[dialect])) {
    current[dialect] = kailiText;
  }
  indoToKailiMap.set(indoText, current);
};

const addKailiEntry = (kailiText, indoText) => {
  if (!kailiText || !indoText) return;

  if (!kailiToIndoMap.has(kailiText)) {
    kailiToIndoMap.set(kailiText, indoText);
  }

  kailiPrefixes.forEach((prefix) => {
    if (kailiText.startsWith(prefix) && kailiText.length > prefix.length + 1) {
      const root = kailiText.slice(prefix.length);
      if (root.length >= 3 && !kailiToIndoMap.has(root)) {
        kailiToIndoMap.set(root, indoText);
      }
    }
  });
};

const loadDictionary = () => {
  if (dictionaryLoaded) return;

  indoToKailiMap = new Map();
  kailiToIndoMap = new Map();

  const data = readJsonFile(filePath);

  data.forEach((item) => {
    const indoParts = splitMeaningParts(item.indonesia);
    const primaryIndo = indoParts[0];
    if (!primaryIndo) return;

    (item.translations || []).forEach((translation) => {
      const dialect = String(translation.dialect || "").toLowerCase().trim();
      if (!validDialects.includes(dialect)) return;

      const kailiParts = splitTranslationParts(translation.word);
      kailiParts.forEach((kailiText, index) => {
        if (index === 0) {
          indoParts.forEach((indoText) => addIndoEntry(indoText, dialect, kailiText));
        }

        addKailiEntry(kailiText, primaryIndo);
      });
    });
  });

  dictionaryLoaded = true;
  console.log(
    `Kamus translate lokal siap: ${indoToKailiMap.size} Indonesia, ${kailiToIndoMap.size} Kaili`
  );
};

const preserveCase = (source, translated) => {
  if (!translated) return source;
  if (source && source[0] === source[0].toUpperCase()) {
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }
  return translated;
};

const getIndoRoots = (word) => {
  const roots = new Set([word]);
  let root = word;
  let suffix = "";

  if (root.endsWith("mu")) {
    suffix = "mu";
    root = root.slice(0, -2);
  } else if (root.endsWith("ku")) {
    suffix = "ku";
    root = root.slice(0, -2);
  } else if (root.endsWith("nya")) {
    suffix = "na";
    root = root.slice(0, -3);
  } else if (root.endsWith("lah")) {
    suffix = "mo";
    root = root.slice(0, -3);
  }

  roots.add(root);

  ["kan", "an", "i"].forEach((ending) => {
    if (root.endsWith(ending) && root.length > ending.length + 2) {
      roots.add(root.slice(0, -ending.length));
    }
  });

  const prefixRules = [
    { prefix: "memper", restore: ["per"] },
    { prefix: "member", restore: ["ber"] },
    { prefix: "mem", restore: ["m", "p", ""] },
    { prefix: "meny", restore: ["s", ""] },
    { prefix: "meng", restore: ["k", "g", "", "h"] },
    { prefix: "men", restore: ["t", "n", ""] },
    { prefix: "me", restore: ["", "m"] },
    { prefix: "diper", restore: ["per"] },
    { prefix: "di", restore: [""] },
    { prefix: "ber", restore: ["", "r"] },
    { prefix: "bel", restore: ["", "l"] },
    { prefix: "ter", restore: ["", "r"] },
    { prefix: "per", restore: ["", "r"] },
    { prefix: "pel", restore: ["", "l"] },
    { prefix: "se", restore: ["", "s"] },
    { prefix: "ke", restore: [""] },
    { prefix: "pem", restore: ["m", "p", ""] },
    { prefix: "peny", restore: ["s", ""] },
    { prefix: "peng", restore: ["k", "g", "", "h"] },
    { prefix: "pen", restore: ["t", "n", ""] },
    { prefix: "pe", restore: ["", "p"] },
  ];

  [...roots].forEach((base) => {
    prefixRules.forEach((rule) => {
      if (base.startsWith(rule.prefix) && base.length > rule.prefix.length + 1) {
        const remainder = base.slice(rule.prefix.length);
        rule.restore.forEach((restore) => {
          const candidate = `${restore}${remainder}`;
          if (candidate.length >= 3) roots.add(candidate);
        });
      }
    });
  });

  return { roots: [...roots], suffix };
};

const getKailiRoots = (word) => {
  const roots = new Set([word]);
  let root = word;
  let suffix = "";

  if (root.endsWith("mu")) {
    suffix = "mu";
    root = root.slice(0, -2);
  } else if (root.endsWith("ku")) {
    suffix = "ku";
    root = root.slice(0, -2);
  } else if (root.endsWith("na")) {
    suffix = "nya";
    root = root.slice(0, -2);
  } else if (root.endsWith("mo")) {
    suffix = "lah";
    root = root.slice(0, -2);
  }

  roots.add(root);

  kailiPrefixes.forEach((prefix) => {
    if (root.startsWith(prefix) && root.length > prefix.length + 1) {
      roots.add(root.slice(prefix.length));
    }
  });

  return { roots: [...roots], suffix };
};

const translateWord = (word, sourceLang, dialect) => {
  const normalized = normalizeText(word);
  if (!normalized) return word;

  if (sourceLang === "indo") {
    const direct = indoToKailiMap.get(normalized)?.[dialect];
    if (direct) return preserveCase(word, direct);

    const { roots, suffix } = getIndoRoots(normalized);
    for (const root of roots) {
      const translated = indoToKailiMap.get(root)?.[dialect];
      if (translated) return preserveCase(word, `${translated}${suffix}`);
    }
  }

  if (sourceLang === "kaili") {
    const direct = kailiToIndoMap.get(normalized);
    if (direct) return preserveCase(word, direct);

    const { roots, suffix } = getKailiRoots(normalized);
    for (const root of roots) {
      const translated = kailiToIndoMap.get(root);
      if (translated) return preserveCase(word, `${translated}${suffix}`);
    }
  }

  return word;
};

const translateByDictionary = (text, sourceLang, dialect) => {
  const tokens = text.match(/[\p{L}\p{N}-]+|[^\p{L}\p{N}-]+/gu) || [];
  const translated = [];
  const maxWords = 5;

  for (let i = 0; i < tokens.length;) {
    if (!/^[\p{L}\p{N}-]+$/u.test(tokens[i])) {
      translated.push(tokens[i]);
      i += 1;
      continue;
    }

    let matched = false;

    for (let size = maxWords; size > 1; size -= 1) {
      const candidateTokens = tokens.slice(i, i + size * 2 - 1);
      const wordTokens = candidateTokens.filter((token) => /^[\p{L}\p{N}-]+$/u.test(token));
      if (wordTokens.length !== size) continue;

      const phrase = normalizeText(wordTokens.join(" "));
      const translation =
        sourceLang === "indo"
          ? indoToKailiMap.get(phrase)?.[dialect]
          : kailiToIndoMap.get(phrase);

      if (translation) {
        translated.push(preserveCase(wordTokens[0], translation));
        i += candidateTokens.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      translated.push(translateWord(tokens[i], sourceLang, dialect));
      i += 1;
    }
  }

  return translated.join("").replace(/\s+([,.!?;:])/g, "$1");
};

exports.getAllVocab = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
};

exports.getVocabById = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  const vocab = data.find((v) => v.id == req.params.id);

  if (!vocab) {
    return res.status(404).json({ message: "Tidak ditemukan" });
  }

  res.json(vocab);
};

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
    if (mode === "indo") {
      const words = item.indonesia
        .toLowerCase()
        .split(";")
        .map((w) => w.trim());

      const matchCount = keywords.filter((k) => words.includes(k)).length;

      return keywords.length === 1
        ? matchCount === 1
        : matchCount >= Math.ceil(keywords.length / 2);
    }

    if (mode === "kaili") {
      return item.translations?.some((t) => {
        const word = t.word?.toLowerCase().trim();
        const matchCount = keywords.filter((k) => word === k).length;

        return keywords.length === 1
          ? matchCount === 1
          : matchCount >= Math.ceil(keywords.length / 2);
      });
    }

    return false;
  });

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

  if (dialect) {
    result = result.filter((item) =>
      item.translations?.some(
        (t) => t.dialect?.toLowerCase().trim() === dialect.toLowerCase().trim()
      )
    );
  }

  if (category) {
    result = result.filter(
      (item) => item.category?.toLowerCase().trim() === category.toLowerCase().trim()
    );
  }

  res.json(result);
};

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

exports.translateSentence = async (req, res) => {
  try {
    const { text, sourceLang, targetLang, dialect } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: "Teks tidak boleh kosong" });
    }

    const selectedDialect = String(dialect || "ledo").toLowerCase();
    if (!validDialects.includes(selectedDialect)) {
      return res.status(400).json({ message: "Dialek tidak tersedia" });
    }

    if (
      !(
        (sourceLang === "indo" && targetLang === "kaili") ||
        (sourceLang === "kaili" && targetLang === "indo")
      )
    ) {
      return res.status(400).json({ message: "Kombinasi bahasa tidak didukung" });
    }

    loadDictionary();

    const translatedText = translateByDictionary(text, sourceLang, selectedDialect);

    res.json({
      translation: translatedText,
      engine: "dictionary",
      dialect: selectedDialect,
    });
  } catch (error) {
    console.error("Error dictionary translation:", error);
    res.status(500).json({ message: "Gagal menerjemahkan kalimat." });
  }
};
