const db = require("../config/db");

exports.addXP = (req, res) => {
  const userId = req.user.id;
  const xp = Number(req.body.xp);

  if (!Number.isFinite(xp) || xp <= 0) {
    return res.status(400).json({ message: "XP tidak valid" });
  }

  db.query(
    "SELECT xp, level FROM student_profiles WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) {
        return res.status(400).json({ message: "Profil siswa tidak ditemukan" });
      }

      let totalXP = (result[0].xp || 0) + xp;
      let level = result[0].level || 1;

      while (totalXP >= 100) {
        totalXP -= 100;
        level += 1;
      }

      let title = "Pemula";
      if (level >= 10) title = "Master";
      else if (level >= 5) title = "Ahli";
      else if (level >= 3) title = "Penjelajah";
      else if (level >= 2) title = "Pelajar";

      db.query(
        "UPDATE student_profiles SET xp = ?, level = ?, title = ? WHERE user_id = ?",
        [totalXP, level, title, userId],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: "XP bertambah",
            xp: totalXP,
            level,
            title,
          });
        }
      );
    }
  );
};
