exports.onlyGuru = (req, res, next) => {
  if (req.user.role !== "guru") {
    return res.status(403).json({ message: "Hanya guru yang boleh akses" });
  }
  next();
};

exports.onlySiswa = (req, res, next) => {
  if (req.user.role !== "siswa") {
    return res.status(403).json({ message: "Hanya siswa yang boleh akses" });
  }
  next();
};