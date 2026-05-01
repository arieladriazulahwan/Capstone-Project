const express = require("express");
const router = express.Router();
const { addXP } = require("../controllers/gamificationController");
const auth = require("../middleware/authMiddleware");

router.post("/xp", auth, addXP);

module.exports = router;