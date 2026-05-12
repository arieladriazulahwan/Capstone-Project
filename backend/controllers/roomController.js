const db = require("../config/db");

const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

exports.createRoom = async (req, res) => {
  try {
    const { title, category, timer, questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: "Questions harus berupa array" });
    }

    const oversizedImage = questions.find((q) => {
      if (!q.image || typeof q.image !== "string") return false;
      const parts = q.image.split(",");
      const base64String = parts[1] || "";
      const decodedSize = Math.floor((base64String.length * 3) / 4);
      return decodedSize > 2 * 1024 * 1024; // 2MB decoded
    });

    if (oversizedImage) {
      return res.status(400).json({
        message: "Gambar terlalu besar. Maksimal sekitar 2MB setelah dikodekan.",
      });
    }

    const code = generateCode();

    db.query(
      `INSERT INTO rooms (title, category, timer, code)
       VALUES (?, ?, ?, ?)`,
      [title, category, timer, code],
      (err, roomResult) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Gagal buat room" });
        }

        const roomId = roomResult.insertId;

        questions.forEach((q) => {
          db.query(
            `INSERT INTO room_questions
            (room_id, type, question, image, answer, answer_type)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
              roomId,
              q.type,
              q.question,
              q.image || null,
              JSON.stringify(q.answer),
              q.answerType || null,
            ],
            (err, questionResult) => {
              if (err) return console.log(err);

              const questionId = questionResult.insertId;

              if (q.options) {
                q.options.forEach((opt) => {
                  db.query(
                    `INSERT INTO room_options
                    (question_id, option_text)
                    VALUES (?, ?)` ,
                    [questionId, opt]
                  );
                });
              }

              if (q.blocks) {
                q.blocks.forEach((block) => {
                  db.query(
                    `INSERT INTO room_blocks
                    (question_id, block_text)
                    VALUES (?, ?)` ,
                    [questionId, block]
                  );
                });
              }
            }
          );
        });

        res.json({
          message: "Room berhasil dibuat",
          code,
        });
      }
    );
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getRooms = (req, res) => {
  db.query(
    "SELECT * FROM rooms ORDER BY id DESC",
    (err, result) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Gagal ambil room",
        });
      }

      res.json(result);
    }
  );
};