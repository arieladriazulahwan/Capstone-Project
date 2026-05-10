const fs = require("fs");
const path = require("path");

exports.getLesson = (req, res) => {
  const { dialect, bab } = req.params;

  try {
    const filePath = path.join(
      __dirname,
      `../data/lesson/${dialect}/bab${bab}.json`
    );

    const data = JSON.parse(fs.readFileSync(filePath));

    res.json(data);
  } catch (err) {
    res.status(404).json({ message: "Lesson tidak ditemukan" });
  }
};