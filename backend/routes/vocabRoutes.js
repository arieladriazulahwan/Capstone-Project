const express = require("express");
const router = express.Router();
const vocab = require("../controllers/vocabController");

// 🔥 SEARCH (taruh di atas supaya tidak ketabrak /:id)
router.get("/search", vocab.searchVocab);

// 🔥 GET ALL
router.get("/", vocab.getAllVocab);

// 🔥 GET BY ID
router.get("/:id", vocab.getVocabById);

// 🔥 ADD DATA
router.post("/", vocab.addVocab);

module.exports = router;