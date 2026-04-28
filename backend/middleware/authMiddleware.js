const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // ambil token dari header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token tidak ada" });
    }

    // format: Bearer TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token tidak valid" });
    }

    // verifikasi token
    const decoded = jwt.verify(token, "SECRET_KEY");

    // simpan data user ke request
    req.user = decoded;

    next(); // lanjut ke controller
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid / expired" });
  }
};

module.exports = authMiddleware;