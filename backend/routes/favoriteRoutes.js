const express = require("express");
const router = express.Router();
const fav = require("../controllers/favoriteController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, fav.getFavorites);
router.post("/", auth, fav.addFavorite);
router.delete("/", auth, fav.removeFavorite);
router.get("/", auth, fav.getFavorites);        // ❤️ untuk toggle icon
router.get("/full", auth, fav.getFavoritesFull); // 📚 untuk dashboard

module.exports = router;