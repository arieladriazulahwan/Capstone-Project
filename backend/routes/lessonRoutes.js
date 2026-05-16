const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const validDialects = ["ledo", "rai"];

// 🔥 GET LESSON BERDASARKAN DIALEK & BAB
router.get("/:dialect/:bab", (req, res) => {
  const { dialect, bab } = req.params;

  if (!validDialects.includes(dialect.toLowerCase())) {
    return res.status(400).json({
      message: "Dialek tidak tersedia",
    });
  }

  try {
    // contoh:
    // data/lesson/ledo/bab1.json
    const filePath = path.join(
      __dirname,
      `../data/lesson/${dialect}/${bab}.json`
    );

    // cek file ada
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Lesson tidak ditemukan",
      });
    }

    const data = JSON.parse(fs.readFileSync(filePath));

    res.json(data);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Gagal load lesson",
    });
  }
});

module.exports = router;
