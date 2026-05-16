const fs = require("fs");
const path = require("path");
const validDialects = ["ledo", "rai"];

exports.getLesson = (req, res) => {
  const { dialect, bab } = req.params;

  if (!validDialects.includes(dialect.toLowerCase())) {
    return res.status(400).json({ message: "Dialek tidak tersedia" });
  }

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
