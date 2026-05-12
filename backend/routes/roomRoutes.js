const express = require("express");
const router = express.Router();

const roomController = require("../controllers/roomController");

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");


// ======================================
// CREATE ROOM
// ======================================
router.post(
  "/create",
  roomController.createRoom
);


// ======================================
// GET ROOMS
// ======================================
router.get(
  "/",
  roomController.getRooms
);


// ======================================
// JOIN ROOM
// ======================================
router.get("/join/:code", authMiddleware, async (req, res) => {

  try {

    const code =
      req.params.code.toUpperCase();

    // ROOM
    const [rooms] =
      await db.promise().query(
        `
        SELECT * FROM rooms
        WHERE code = ?
        `,
        [code]
      );

    if (rooms.length === 0) {

      return res.status(404).json({
        message: "Room tidak ditemukan",
      });

    }

    const room = rooms[0];

    // QUESTIONS
    const [questions] =
      await db.promise().query(
        `
        SELECT * FROM room_questions
        WHERE room_id = ?
        `,
        [room.id]
      );

    // LOOP QUESTIONS
    for (const q of questions) {

      // OPTIONS
      const [options] =
        await db.promise().query(
          `
          SELECT * FROM room_options
          WHERE question_id = ?
          `,
          [q.id]
        );

      // BLOCKS
      const [blocks] =
        await db.promise().query(
          `
          SELECT * FROM room_blocks
          WHERE question_id = ?
          `,
          [q.id]
        );

      q.options = options.map(
        (o) => o.option_text
      );

      q.blocks = blocks.map(
        (b) => b.block_text
      );

      q.answerType = q.answer_type; // Map to camelCase for frontend

    }

    room.questions = questions;

    res.json({
      success: true,
      room,
      room_code: room.code,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });

  }

});

const parseAnswer = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeQuestion = async (q) => {
  const [options] = await db.promise().query(
    `
    SELECT * FROM room_options
    WHERE question_id = ?
    `,
    [q.id]
  );

  const [blocks] = await db.promise().query(
    `
    SELECT * FROM room_blocks
    WHERE question_id = ?
    `,
    [q.id]
  );

  return {
    ...q,
    answer: parseAnswer(q.answer),
    options: options.map((o) => o.option_text),
    blocks: blocks.map((b) => b.block_text),
    answerType: q.answer_type,
  };
};

router.get("/detail/:id", authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.id;

    const [rooms] = await db.promise().query(
      `
      SELECT * FROM rooms
      WHERE id = ?
      `,
      [roomId]
    );

    if (rooms.length === 0) {
      return res.status(404).json({
        message: "Room tidak ditemukan",
      });
    }

    const room = rooms[0];

    const [questions] = await db.promise().query(
      `
      SELECT * FROM room_questions
      WHERE room_id = ?
      `,
      [roomId]
    );

    const detailedQuestions = await Promise.all(
      questions.map(normalizeQuestion)
    );

    const [attempts] = await db.promise().query(
      `
      SELECT ra.id, ra.score, ra.total, ra.created_at, u.name AS student_name
      FROM room_attempts ra
      JOIN users u ON ra.user_id = u.id
      WHERE ra.room_id = ?
      ORDER BY ra.created_at DESC
      `,
      [roomId]
    );

    for (const attempt of attempts) {
      const [answers] = await db.promise().query(
        `
        SELECT question_id, answer, is_correct FROM room_attempt_answers WHERE attempt_id = ?
        `,
        [attempt.id]
      );

      attempt.answers = answers.map((a) => ({
        ...a,
        answer: parseAnswer(a.answer),
      }));
    }

    room.questions = detailedQuestions;
    room.attempts = attempts;

    res.json({
      success: true,
      room,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

router.post("/submit/:code", authMiddleware, async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const answers = req.body.answers || {};
    const userId = req.user.id;

    const [rooms] = await db.promise().query(
      `
      SELECT * FROM rooms
      WHERE code = ?
      `,
      [code]
    );

    if (rooms.length === 0) {
      return res.status(404).json({
        message: "Room tidak ditemukan",
      });
    }

    const room = rooms[0];

    const [questions] = await db.promise().query(
      `
      SELECT * FROM room_questions
      WHERE room_id = ?
      `,
      [room.id]
    );

    const normalizeValue = (value) => {
      if (Array.isArray(value)) {
        return value.join(" ").trim().toLowerCase();
      }
      return String(value || "").trim().toLowerCase();
    };

    let score = 0;
    const total = questions.length;

    const answerRecords = questions.map((question, index) => {
      const correctAnswer = parseAnswer(question.answer);
      const submittedRaw = answers[index];
      const submitted = normalizeValue(submittedRaw);
      const expected = normalizeValue(correctAnswer);
      const isCorrect = submitted === expected;

      if (isCorrect) score += 1;

      return {
        questionId: question.id,
        answer: submittedRaw,
        isCorrect: isCorrect ? 1 : 0,
      };
    });

    const [result] = await db.promise().query(
      `
      INSERT INTO room_attempts (room_id, user_id, score, total)
      VALUES (?, ?, ?, ?)
      `,
      [room.id, userId, score, total]
    );

    const attemptId = result.insertId;

    await Promise.all(
      answerRecords.map((record) =>
        db.promise().query(
          `
          INSERT INTO room_attempt_answers (attempt_id, question_id, answer, is_correct)
          VALUES (?, ?, ?, ?)
          `,
          [attemptId, record.questionId, JSON.stringify(record.answer), record.isCorrect]
        )
      )
    );

    res.json({
      success: true,
      score,
      total,
      message: "Jawaban berhasil disimpan",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

router.put("/questions/:id", authMiddleware, async (req, res) => {
  try {
    const questionId = req.params.id;
    const {
      question,
      type,
      answer,
      answerType,
      options = [],
      blocks = [],
    } = req.body;

    const storedAnswer = JSON.stringify(answer || "");

    await db.promise().query(
      `
      UPDATE room_questions
      SET question = ?, type = ?, answer = ?, answer_type = ?
      WHERE id = ?
      `,
      [question, type, storedAnswer, answerType || null, questionId]
    );

    await db.promise().query(
      `DELETE FROM room_options WHERE question_id = ?`,
      [questionId]
    );

    await Promise.all(
      options.map((opt) =>
        db.promise().query(
          `INSERT INTO room_options (question_id, option_text) VALUES (?, ?)`,
          [questionId, opt]
        )
      )
    );

    await db.promise().query(
      `DELETE FROM room_blocks WHERE question_id = ?`,
      [questionId]
    );

    await Promise.all(
      blocks.map((block) =>
        db.promise().query(
          `INSERT INTO room_blocks (question_id, block_text) VALUES (?, ?)`,
          [questionId, block]
        )
      )
    );

    const [updatedRows] = await db.promise().query(
      `SELECT * FROM room_questions WHERE id = ?`,
      [questionId]
    );

    const updatedQuestion = await normalizeQuestion(updatedRows[0]);

    res.json({
      success: true,
      question: updatedQuestion,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;