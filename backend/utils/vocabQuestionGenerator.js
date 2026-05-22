const fs = require("fs");
const path = require("path");

const vocabPath = path.join(__dirname, "../data/vocab.json");

const BAB1_CATEGORIES = new Set([
  "kata benda",
  "kata kerja",
  "kata sifat",
  "kata keterangan",
  "kata ganti",
  "kata depan",
  "kata sambung",
  "kata bilangan",
  "kata seru",
  "kata sandang",
]);

const BAB3_SUBJECTS = new Set([
  "Kehidupan Desa dan Masyarakat",
  "Penyakit dan Pengobatan",
  "Sistem Kekerabatan",
  "Bagian Tubuh",
  "Gerak dan Kerja",
  "Tanaman",
  "Kata Tugas",
  "Perangai, Kata sifat, dan Warna",
  "Makanan dan Minuman",
  "Peralatan dan Perlengkapan",
  "Binatang",
  "Kata Ganti, Sapaan",
  "Mata Pencaharian",
  "Permainan",
  "Kata Bilangan",
  "Rumah dan Bagian-bagiannya",
  "Musim, Keadaan Alam",
  "Pakaian dan Perhiasan",
  "Swadesh List",
]);

const normalize = (value = "") => String(value).toLowerCase().trim();

const normalizeCategory = (category = "") => {
  const normalized = normalize(category);

  if (normalized === "kata hubung") return "kata sambung";
  return normalized;
};

const cleanText = (value = "") =>
  String(value)
    .split(";")[0]
    .replace(/\s+/g, " ")
    .trim();

const getVocabRows = (dialect) => {
  const vocab = JSON.parse(fs.readFileSync(vocabPath, "utf-8"));
  const targetDialect = normalize(dialect);

  return vocab
    .map((item) => {
      const translation = item.translations?.find(
        (entry) => normalize(entry.dialect) === targetDialect
      );

      return {
        dialect: targetDialect,
        category: normalizeCategory(item.category),
        subject: cleanText(item.subject),
        indonesia: cleanText(item.indonesia),
        word: cleanText(translation?.word),
      };
    })
    .filter(
      (item) =>
        item.word &&
        item.indonesia &&
        item.word.length <= 35 &&
        item.indonesia.length <= 70 &&
        (BAB1_CATEGORIES.has(item.category) || BAB3_SUBJECTS.has(item.subject))
    );
};

const buildOptions = (answer, pool) => {
  const normalizedAnswer = normalize(answer);
  const options = [answer];

  for (const item of pool) {
    if (options.length >= 4) break;
    if (normalize(item.indonesia) === normalizedAnswer) continue;
    if (options.some((option) => normalize(option) === normalize(item.indonesia))) {
      continue;
    }

    options.push(item.indonesia);
  }

  return options;
};

const splitAnswerBlocks = (answer) => {
  const words = answer.split(" ").filter(Boolean);

  if (words.length > 1) {
    return words.map((word, index) =>
      index + 1 < words.length ? `${word} ` : word
    );
  }

  const midpoint = Math.ceil(answer.length / 2);
  return [answer.slice(0, midpoint), answer.slice(midpoint)].filter(Boolean);
};

const buildBlocks = (answer, pool) => {
  const blocks = splitAnswerBlocks(answer);

  for (const item of pool) {
    if (blocks.length >= 5) break;
    const distractor = splitAnswerBlocks(item.indonesia)[0];

    if (
      distractor &&
      !blocks.some((block) => normalize(block) === normalize(distractor))
    ) {
      blocks.push(distractor);
    }
  }

  return blocks;
};

const generateVocabQuestions = ({ dialect, bab, type = "practice", startId = 10000 }) => {
  const targetBab = normalize(bab);
  if (!["bab1", "bab3"].includes(targetBab)) return [];

  const rows = getVocabRows(dialect).filter((item) =>
    targetBab === "bab1"
      ? BAB1_CATEGORIES.has(item.category)
      : BAB3_SUBJECTS.has(item.subject)
  );
  const byCategory = rows.reduce((groups, item) => {
    const groupKey = targetBab === "bab1" ? item.category : item.subject;
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {});

  let nextId = startId;

  return Object.entries(byCategory).flatMap(([category, items]) =>
    items.map((item, index) => {
      const options = buildOptions(item.indonesia, items);
      const baseQuestion = {
        id: nextId++,
        dialect: normalize(dialect),
        bab: targetBab,
        category,
        wordCategory: item.category,
        source: "vocab",
        answer: item.indonesia,
      };

      if (type === "quiz" && index % 3 === 0 && item.indonesia.length <= 24) {
        return {
          ...baseQuestion,
          question: `Susun arti kata '${item.word}'.`,
          blocks: buildBlocks(item.indonesia, items),
        };
      }

      return {
        ...baseQuestion,
        question: `Apa arti '${item.word}'?`,
        options,
      };
    })
  );
};

const generateVocabLessons = ({ dialect, bab, startId = 40000 }) => {
  const targetBab = normalize(bab);
  if (!["bab1", "bab3"].includes(targetBab)) return [];

  let nextId = startId;

  return getVocabRows(dialect)
    .filter((item) =>
      targetBab === "bab1"
        ? BAB1_CATEGORIES.has(item.category)
        : BAB3_SUBJECTS.has(item.subject)
    )
    .map((item) => ({
      id: nextId++,
      source: "vocab",
      indo: item.indonesia,
      kaili: item.word,
      tipe: "kosakata",
      category: targetBab === "bab1" ? item.category : item.subject,
      subject: item.subject,
      wordCategory: item.category,
    }));
};

module.exports = { generateVocabLessons, generateVocabQuestions };
