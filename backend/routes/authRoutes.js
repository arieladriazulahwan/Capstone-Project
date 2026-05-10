const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/add-xp", authMiddleware, authController.addXP);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authMiddleware, authController.getProfile);
router.post("/complete-bab1", authMiddleware, authController.completeBab1);
router.put("/dialect", authMiddleware, authController.updateDialect);
router.put("/add-xp", authMiddleware, authController.addXP);

module.exports = router;