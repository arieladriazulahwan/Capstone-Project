const express = require("express");
const router = express.Router();
const fav = require("../controllers/favoriteController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, fav.getFavorites);
router.get("/full", auth, fav.getFavoritesFull);
router.post("/", auth, fav.addFavorite);
router.delete("/", auth, fav.removeFavorite);

module.exports = router;
