require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bahasa_kaili",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, conn) => {
  if (err) {
    console.log("Koneksi gagal:", err);
  } else {
    console.log("Terhubung ke MySQL XAMPP (Pool)");
    conn.release();
  }
});

db.on("error", (err) => {
  console.error("MySQL connection error:", err);
});

module.exports = db;
