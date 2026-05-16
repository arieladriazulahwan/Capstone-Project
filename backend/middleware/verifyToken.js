const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token tidak ada",
    });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {

    return res.status(403).json({
      message: "Token tidak valid",
    });

  }
};

module.exports = verifyToken;
