const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// contoh route yang diproteksi
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Akses berhasil",
    user: req.user
  });
});

router.post("/login", authController.login);
router.post("/register", authController.register);

module.exports = router;