const fs = require("fs");
const path = require("path");

const quizPath = path.join(__dirname, "../data/quiz.json");
const validDialects = ["ledo", "rai"];

// 🔥 GET QUIZ BY DIALECT + BAB
exports.getQuiz = (req, res) => {
  const { dialect, bab } = req.query;

  const data = JSON.parse(fs.readFileSync(quizPath));

  let result = data;

  if (dialect) {
    if (!validDialects.includes(dialect.toLowerCase())) {
      return res.status(400).json({ message: "Dialek tidak tersedia" });
    }

    result = result.filter(
      (q) => q.dialect.toLowerCase() === dialect.toLowerCase()
    );
  }

  if (bab) {
    result = result.filter(
      (q) => q.bab.toLowerCase() === bab.toLowerCase()
    );
  }

  res.json(result);
};
