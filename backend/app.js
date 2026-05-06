const express = require("express");
const cors = require("cors");
const vocabRoutes = require("./routes/vocabRoutes");


const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

app.use("/api/game", require("./routes/gamification"));

app.use("/api/vocab", vocabRoutes);
app.use("/api/lesson", require("./routes/lessonRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));