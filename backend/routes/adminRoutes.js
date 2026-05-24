const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const { onlyAdmin } = require("../middleware/roleMiddleware");

// ======================================
// 📊 DASHBOARD STATS
// ======================================
router.get("/stats", authMiddleware, onlyAdmin, adminController.getDashboardStats);

// ======================================
// 🔤 CRUD KAMUS
// ======================================
router.get("/vocab", authMiddleware, onlyAdmin, adminController.getAllVocab);
router.post("/vocab", authMiddleware, onlyAdmin, adminController.addVocab);
router.put("/vocab/:id", authMiddleware, onlyAdmin, adminController.updateVocab);
router.delete("/vocab/:id", authMiddleware, onlyAdmin, adminController.deleteVocab);

// ======================================
// 📖 CRUD MATERI
// ======================================
router.get("/lessons", authMiddleware, onlyAdmin, adminController.getLessons);
router.get("/lessons/:dialect/:bab", authMiddleware, onlyAdmin, adminController.getLesson);
router.put("/lessons/:dialect/:bab", authMiddleware, onlyAdmin, adminController.updateLesson);
router.delete("/lessons/:dialect/:bab", authMiddleware, onlyAdmin, adminController.deleteLesson);

router.get("/practices", authMiddleware, onlyAdmin, adminController.getPractices);
router.get("/practices/:dialect/:bab", authMiddleware, onlyAdmin, adminController.getPractice);
router.put("/practices/:dialect/:bab", authMiddleware, onlyAdmin, adminController.updatePractice);
router.delete("/practices/:dialect/:bab", authMiddleware, onlyAdmin, adminController.deletePractice);
router.put("/babs", authMiddleware, onlyAdmin, adminController.updateBabs);

// ======================================
// 📝 CRUD KUIS
// ======================================
router.get("/quiz", authMiddleware, onlyAdmin, adminController.getAllQuiz);
router.post("/quiz", authMiddleware, onlyAdmin, adminController.addQuiz);
router.put("/quiz/reorder", authMiddleware, onlyAdmin, adminController.reorderQuiz);
router.put("/quiz/:id", authMiddleware, onlyAdmin, adminController.updateQuiz);
router.delete("/quiz/:id", authMiddleware, onlyAdmin, adminController.deleteQuiz);

// ======================================
// 👥 USER MANAGEMENT
// ======================================
router.get("/users", authMiddleware, onlyAdmin, adminController.getAllUsers);
router.post("/users", authMiddleware, onlyAdmin, adminController.createUser);
router.get("/users/:id", authMiddleware, onlyAdmin, adminController.getUserById);
router.put("/users/:id", authMiddleware, onlyAdmin, adminController.updateUser);
router.patch("/users/:id/block", authMiddleware, onlyAdmin, adminController.blockUser);
router.patch("/users/:id/password", authMiddleware, onlyAdmin, adminController.resetPassword);
router.delete("/users/:id", authMiddleware, onlyAdmin, adminController.deleteUser);

// ======================================
// 🏠 MODERASI ROOM
// ======================================
router.get("/rooms", authMiddleware, onlyAdmin, adminController.getAllRooms);
router.get("/rooms/:id", authMiddleware, onlyAdmin, adminController.getRoomDetail);
router.delete("/rooms/:id", authMiddleware, onlyAdmin, adminController.deleteRoom);

module.exports = router;
