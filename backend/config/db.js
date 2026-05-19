require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bahasa_kaili",
});

const connectDatabase = () => {
  db.connect((err) => {
    if (err) {
      console.log("Koneksi gagal:", err);
    } else {
      console.log("Terhubung ke MySQL XAMPP");
    }
  });
};

// Handle fatal connection errors so the process does not crash silently.
db.on("error", (err) => {
  console.error("MySQL connection error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("MySQL connection lost. Restart server to reconnect.");
  }
});

connectDatabase();

module.exports = db;
