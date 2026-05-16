const db = require("../config/db");

const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

exports.createRoom = async (req, res) => {
  const connection = db.promise();

  try {
    const { title, category, timer, questions } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Judul room wajib diisi" });
    }

    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: "Questions harus berupa array" });
    }

    if (questions.length === 0) {
      return res.status(400).json({ message: "Minimal harus ada satu soal" });
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

    await connection.query("START TRANSACTION");

    let code = generateCode();
    let roomResult;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        [roomResult] = await connection.query(
          `INSERT INTO rooms (title, category, timer, code)
           VALUES (?, ?, ?, ?)`,
          [title.trim(), category || null, Number(timer) || 0, code]
        );
        break;
      } catch (err) {
        if (err.code !== "ER_DUP_ENTRY" || attempt === 4) {
          throw err;
        }
        code = generateCode();
      }
    }

    const roomId = roomResult.insertId;

    for (const q of questions) {
      const [questionResult] = await connection.query(
        `INSERT INTO room_questions
         (room_id, type, question, image, answer, answer_type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          roomId,
          q.type,
          q.question || "",
          q.image || null,
          JSON.stringify(q.answer ?? ""),
          q.answerType || null,
        ]
      );

      const questionId = questionResult.insertId;
      const options = Array.isArray(q.options) ? q.options.filter(Boolean) : [];
      const blocks = Array.isArray(q.blocks) ? q.blocks.filter(Boolean) : [];

      for (const opt of options) {
        await connection.query(
          `INSERT INTO room_options (question_id, option_text)
           VALUES (?, ?)`,
          [questionId, opt]
        );
      }

      for (const block of blocks) {
        await connection.query(
          `INSERT INTO room_blocks (question_id, block_text)
           VALUES (?, ?)`,
          [questionId, block]
        );
      }
    }

    await connection.query("COMMIT");

    res.json({
      message: "Room berhasil dibuat",
      code,
    });
  } catch (err) {
    console.log(err);
    try {
      await connection.query("ROLLBACK");
    } catch (rollbackErr) {
      console.log(rollbackErr);
    }

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
