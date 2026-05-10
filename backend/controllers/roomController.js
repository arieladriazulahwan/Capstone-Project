const db = require("../config/db");

// =====================================
// 🎲 GENERATE ROOM CODE
// =====================================

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// =====================================
// ➕ CREATE ROOM
// =====================================

exports.createRoom = (req, res) => {

  const userId = req.user.id;

  const {
    title,
    category,
    timer,
    quizType,
    questions,
  } = req.body;

  const roomCode = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  // =====================================
  // INSERT ROOM
  // =====================================

  db.query(
    `
    INSERT INTO quiz_rooms
    (teacher_id, title, category, timer, quiz_type, room_code)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      title,
      category,
      timer,
      quizType,
      roomCode,
    ],
    (err, roomResult) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      const roomId = roomResult.insertId;

      // =====================================
      // INSERT QUESTIONS
      // =====================================

      questions.forEach((q) => {

        db.query(
          `
          INSERT INTO quiz_questions
          (room_id, question, question_type, correct_answer)
          VALUES (?, ?, ?, ?)
          `,
          [
            roomId,
            q.question,
            q.type,
            q.answer,
          ],
          (err, questionResult) => {

            if (err) {
              console.log(err);
              return;
            }

            const questionId = questionResult.insertId;

            // =====================================
            // INSERT OPTIONS
            // =====================================

            if (q.options && q.options.length > 0) {

              q.options.forEach((opt) => {

                db.query(
                  `
                  INSERT INTO quiz_options
                  (question_id, option_text, is_correct)
                  VALUES (?, ?, ?)
                  `,
                  [
                    questionId,
                    opt,
                    opt === q.answer,
                  ]
                );

              });

            }

          }
        );

      });

      res.json({
        message: "Room berhasil dibuat 🎉",
        roomCode,
      });

    }
  );

};
// =====================================
// 📥 GET ROOM GURU
// =====================================

exports.getRooms = (req, res) => {

  const userId = req.user.id;

  db.query(
    `
    SELECT * FROM quiz_rooms
    WHERE teacher_id=?
    ORDER BY id DESC
    `,
    [userId],
    (err, results) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(results);

    }
  );
};

// =====================================
// 👨‍🎓 JOIN ROOM
// =====================================

exports.joinRoom = (req, res) => {

  const code = req.params.code;

  db.query(
    `
    SELECT * FROM quiz_rooms
    WHERE room_code=?
    `,
    [code],
    (err, results) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Room tidak ditemukan",
        });
      }

      res.json(results[0]);

    }
  );
};

// =====================================
// 📄 DETAIL ROOM
// =====================================

exports.getRoomDetail = (req, res) => {

  const roomId = req.params.id;

  // ====================================
  // GET ROOM
  // ====================================

  db.query(
    `
    SELECT * FROM quiz_rooms
    WHERE id=?
    `,
    [roomId],
    (err, roomResult) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      if (roomResult.length === 0) {
        return res.status(404).json({
          message: "Room tidak ditemukan",
        });
      }

      const room = roomResult[0];

      // ====================================
      // GET QUESTIONS
      // ====================================

      db.query(
        `
        SELECT * FROM quiz_questions
        WHERE room_id=?
        `,
        [roomId],
        (err, questionResult) => {

          if (err) {
            console.log(err);
            return res.status(500).json(err);
          }

          // ====================================
          // GET OPTIONS
          // ====================================

          const questions = [];

          let completed = 0;

          if (questionResult.length === 0) {

            return res.json({
              ...room,
              questions: [],
            });

          }

          questionResult.forEach((q, index) => {

            db.query(
              `
              SELECT * FROM quiz_options
              WHERE question_id=?
              `,
              [q.id],
              (err, optionResult) => {

                if (err) {
                  console.log(err);
                  return;
                }

                questions[index] = {
                  ...q,
                  options: optionResult,
                };

                completed++;

                // ====================================
                // RETURN FINAL
                // ====================================

                if (completed === questionResult.length) {

                  res.json({
                    ...room,
                    questions,
                  });

                }

              }
            );

          });

        }
      );

    }
  );

};

exports.getQuizByCode = (req, res) => {

  const { code } = req.params;

  const roomQuery = `
    SELECT * FROM quiz_rooms
    WHERE room_code=?
  `;

  db.query(roomQuery, [code], (err, roomResult) => {

    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }

    if (roomResult.length === 0) {
      return res.status(404).json({
        message: "Room tidak ditemukan",
      });
    }

    const room = roomResult[0];

    const questionQuery = `
      SELECT * FROM quiz_questions
      WHERE room_id=?
    `;

    db.query(
      questionQuery,
      [room.id],
      (err2, questionResult) => {

        if (err2) {
          console.log(err2);
          return res.status(500).json({
            message: "Server error",
          });
        }

        const questions = [];

        let done = 0;

        if (questionResult.length === 0) {

          return res.json({
            room,
            questions: [],
          });

        }

        questionResult.forEach((q, index) => {

          db.query(
            `
            SELECT * FROM quiz_options
            WHERE question_id=?
            `,
            [q.id],
            (err3, optionResult) => {

              questions[index] = {
                ...q,
                options: optionResult,
              };

              done++;

              if (done === questionResult.length) {

                res.json({
                  room,
                  questions,
                });

              }
            }
          );
        });
      }
    );
  });
};