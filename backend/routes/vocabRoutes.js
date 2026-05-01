const express = require("express");
const router = express.Router();
const vocab = require("../controllers/vocabController");

router.get("/", vocab.getAllVocab);
router.get("/search", vocab.searchVocab);
router.get("/:id", vocab.getVocabById);
router.post("/", vocab.addVocab);

module.exports = router;