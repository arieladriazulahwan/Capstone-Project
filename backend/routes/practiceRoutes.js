const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

// 🔥 GET PRACTICE
router.get("/:dialect/:bab", (req, res) => {
  const { dialect, bab } = req.params;

  try {
    const filePath = path.join(
      __dirname,
      "..",
      "data",
      "practice",
      dialect,
      `${bab}.json`
    );

    console.log("PRACTICE FILE:", filePath);

    // 🔥 cek file
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Practice tidak ditemukan",
      });
    }

    const data = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );

    res.json(data);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;