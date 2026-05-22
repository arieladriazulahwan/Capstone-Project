const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const { generateVocabQuestions } = require("../utils/vocabQuestionGenerator");
const validDialects = ["ledo", "rai"];

// 🔥 GET PRACTICE
router.get("/:dialect/:bab", (req, res) => {
  const { dialect, bab } = req.params;

  if (!validDialects.includes(dialect.toLowerCase())) {
    return res.status(400).json({
      message: "Dialek tidak tersedia",
    });
  }

  try {
    const filePath = path.join(
      __dirname,
      "..",
      "data",
      "practice",
      dialect,
      `${bab}.json`
    );

    // 🔥 cek file
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Practice tidak ditemukan",
      });
    }

    const data = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );

    const vocabQuestions = generateVocabQuestions({
      dialect,
      bab,
      type: "practice",
      startId: 20000,
    });

    res.json([...data, ...vocabQuestions]);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
