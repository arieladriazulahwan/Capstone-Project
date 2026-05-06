const express = require("express");
const router = express.Router();
const data = require("../data/bab1.json");

router.get("/bab1", (req, res) => {
  res.json(data);
});

module.exports = router;