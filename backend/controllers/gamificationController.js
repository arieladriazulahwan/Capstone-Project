const db = require("../config/db");

exports.addXP = (req, res) => {
  const userId = req.user.id;
  const { xp } = req.body;

  db.query(
    "SELECT xp, level FROM users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      let totalXP = result[0].xp + xp;
      let level = result[0].level;

      // LOGIKA LEVEL
      if (totalXP >= level * 100) {
        level += 1;
      }

      db.query(
        "UPDATE users SET xp = ?, level = ? WHERE id = ?",
        [totalXP, level, userId],
        () => {
          res.json({
            message: "XP bertambah",
            xp: totalXP,
            level,
          });
        }
      );
    }
  );
};