import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getBab, getLevels } from "../data/levelMap";

const colorClass = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
};

function BabLevels() {
  const navigate = useNavigate();
  const { dialect, bab } = useParams();
  const [progress, setProgress] = useState(null);

  const babInfo = getBab(bab);
  const levels = getLevels(bab);
  const buttonColor = colorClass[babInfo?.color] || "bg-green-500";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:3000/api/auth/profile", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const userData = data.user || data;
        setProgress(userData.progress || {});
      })
      .catch((err) => {
        console.log("Gagal ambil progress level:", err);
      });
  }, []);

  const isLevelUnlocked = (level, index) => {
    if (!progress) return index === 0;
    return Boolean(progress.levels?.[bab]?.[level.key]) || index === 0;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar showBackButton backTo="/level" />

      <main className="p-4 max-w-xl mx-auto">
        <div className="bg-white rounded-2xl p-5 shadow mb-5">
          <p className="text-sm text-gray-500 font-semibold">
            {babInfo?.label || bab?.toUpperCase()}
          </p>
          <h1 className="text-2xl font-bold">
            {babInfo?.title || "Level Bab"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pilih level untuk membuka materi, latihan, dan quiz.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {levels.map((level, index) => {
            const unlocked = isLevelUnlocked(level, index);

            return (
              <div
                key={level.key}
                className={`rounded-xl border p-4 shadow flex justify-between items-center gap-3 ${
                  unlocked ? "bg-white" : "bg-gray-100 opacity-75"
                }`}
              >
                <div>
                  <p className="font-semibold">
                    Level {index + 1} - {level.title}
                  </p>
                  <p className="text-sm text-gray-500">{level.description}</p>
                </div>

                {unlocked ? (
                  <button
                    onClick={() =>
                      navigate(`/lesson/${dialect}/${bab}/${level.key}`)
                    }
                    className={`${buttonColor} text-white text-sm px-3 py-2 rounded-lg`}
                  >
                    Mulai
                  </button>
                ) : (
                  <span className="text-sm text-gray-400">Terkunci</span>
                )}
              </div>
            );
          })}

          {levels.length === 0 && (
            <div className="bg-white rounded-xl p-4 text-center text-gray-500">
              Level belum tersedia.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default BabLevels;
