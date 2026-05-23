require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const createJsonDataTables = require("../utils/jsonDataTables");

const dataDir = path.join(__dirname, "..", "data");

const readJson = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

const readCollectionFiles = (group) => {
  const groupDir = path.join(dataDir, group);
  const rows = [];

  if (!fs.existsSync(groupDir)) return rows;

  for (const dialect of fs.readdirSync(groupDir)) {
    const dialectDir = path.join(groupDir, dialect);
    if (!fs.statSync(dialectDir).isDirectory()) continue;

    for (const file of fs.readdirSync(dialectDir)) {
      if (!file.endsWith(".json")) continue;
      const bab = path.basename(file, ".json");
      const items = readJson(path.join(dialectDir, file));

      if (!Array.isArray(items)) continue;

      items.forEach((item, index) => {
        rows.push({ dialect, bab, item, index });
      });
    }
  }

  return rows;
};

const resetTables = async (connection) => {
  const tables = [
    "quiz_blocks",
    "quiz_options",
    "quiz_items",
    "practice_options",
    "practice_items",
    "lesson_items",
    "vocab_translations",
    "vocab_entries",
  ];

  for (const table of tables) {
    await connection.query(`DELETE FROM ${table}`);
  }
};

const seedVocab = async (connection) => {
  const vocab = readJson(path.join(dataDir, "vocab.json"));
  let entries = 0;
  let translations = 0;

  for (const item of vocab) {
    await connection.query(
      `INSERT INTO vocab_entries (id, subject, indonesia, category, raw_json)
       VALUES (?, ?, ?, ?, ?)`,
      [
        item.id,
        item.subject || null,
        item.indonesia || "",
        item.category || null,
        JSON.stringify(item),
      ]
    );
    entries += 1;

    for (const translation of item.translations || []) {
      if (!translation?.word) continue;
      await connection.query(
        `INSERT INTO vocab_translations (vocab_id, dialect, word)
         VALUES (?, ?, ?)`,
        [item.id, translation.dialect || "", translation.word]
      );
      translations += 1;
    }
  }

  return { entries, translations };
};

const seedLessons = async (connection) => {
  const rows = readCollectionFiles("lesson");

  for (const { dialect, bab, item, index } of rows) {
    await connection.query(
      `INSERT INTO lesson_items
       (dialect, bab, item_order, indo, kaili, tipe, category, image, raw_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dialect,
        bab,
        index + 1,
        item.indo || item.indonesia || null,
        item.kaili || item.answer || null,
        item.tipe || null,
        item.category || item.subject || null,
        item.image || item.gambar || null,
        JSON.stringify(item),
      ]
    );
  }

  return rows.length;
};

const seedPractices = async (connection) => {
  const rows = readCollectionFiles("practice");
  let options = 0;

  for (const { dialect, bab, item, index } of rows) {
    const [result] = await connection.query(
      `INSERT INTO practice_items
       (dialect, bab, item_order, category, question, answer, image, raw_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dialect,
        bab,
        index + 1,
        item.category || item.subject || null,
        item.question || "",
        item.answer || "",
        item.image || null,
        JSON.stringify(item),
      ]
    );

    for (const [optionIndex, option] of (item.options || []).entries()) {
      if (!option) continue;
      await connection.query(
        `INSERT INTO practice_options (practice_id, option_order, option_text)
         VALUES (?, ?, ?)`,
        [result.insertId, optionIndex + 1, option]
      );
      options += 1;
    }
  }

  return { items: rows.length, options };
};

const seedQuiz = async (connection) => {
  const quiz = readJson(path.join(dataDir, "quiz.json"));
  let options = 0;
  let blocks = 0;

  for (const [index, item] of quiz.entries()) {
    const [result] = await connection.query(
      `INSERT INTO quiz_items
       (source_id, dialect, bab, item_order, category, question, answer, image, raw_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id || null,
        item.dialect || "",
        item.bab || "",
        index + 1,
        item.category || item.subject || null,
        item.question || "",
        item.answer || "",
        item.image || null,
        JSON.stringify(item),
      ]
    );

    for (const [optionIndex, option] of (item.options || []).entries()) {
      if (!option) continue;
      await connection.query(
        `INSERT INTO quiz_options (quiz_id, option_order, option_text)
         VALUES (?, ?, ?)`,
        [result.insertId, optionIndex + 1, option]
      );
      options += 1;
    }

    for (const [blockIndex, block] of (item.blocks || []).entries()) {
      if (!block) continue;
      await connection.query(
        `INSERT INTO quiz_blocks (quiz_id, block_order, block_text)
         VALUES (?, ?, ?)`,
        [result.insertId, blockIndex + 1, block]
      );
      blocks += 1;
    }
  }

  return { items: quiz.length, options, blocks };
};

const main = async () => {
  const connection = await db.promise().getConnection();

  try {
    await createJsonDataTables(db);
    await connection.query("START TRANSACTION");
    await resetTables(connection);

    const vocab = await seedVocab(connection);
    const lessons = await seedLessons(connection);
    const practices = await seedPractices(connection);
    const quiz = await seedQuiz(connection);

    await connection.query("COMMIT");

    console.log("Seed data JSON berhasil.");
    console.log(`- vocab_entries: ${vocab.entries}`);
    console.log(`- vocab_translations: ${vocab.translations}`);
    console.log(`- lesson_items: ${lessons}`);
    console.log(`- practice_items: ${practices.items}`);
    console.log(`- practice_options: ${practices.options}`);
    console.log(`- quiz_items: ${quiz.items}`);
    console.log(`- quiz_options: ${quiz.options}`);
    console.log(`- quiz_blocks: ${quiz.blocks}`);
  } catch (err) {
    await connection.query("ROLLBACK");
    console.error("Gagal seed data JSON:", err);
    process.exitCode = 1;
  } finally {
    connection.release();
    db.end();
  }
};

main();
