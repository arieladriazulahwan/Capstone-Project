const express = require("express");
const router = express.Router();

const roomController = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

// CREATE ROOM
router.post(
  "/",
  authMiddleware,
  roomController.createRoom
);

// GET ROOM GURU
router.get(
  "/",
  authMiddleware,
  roomController.getRooms
);

// DETAIL ROOM
router.get(
  "/detail/:id",
  authMiddleware,
  roomController.getRoomDetail
);

// JOIN ROOM / GET QUIZ BY CODE
router.get(
  "/:code",
  authMiddleware,
  roomController.getQuizByCode
);

module.exports = router;