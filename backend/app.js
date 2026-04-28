const express = require("express");
const app = express();

const authRoutes = require("./routes/authRoutes");
const cors = require("cors");

app.use(cors());

app.use(express.json());

// route
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server berjalan...");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

