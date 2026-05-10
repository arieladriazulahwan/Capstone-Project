const express = require("express");
const cors = require("cors");
const vocabRoutes = require("./routes/vocabRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const practiceRoutes = require("./routes/practiceRoutes");
const roomRoutes = require("./routes/roomRoutes");


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
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/lesson", lessonRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/rooms", roomRoutes);