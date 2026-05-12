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
module.exports = router;