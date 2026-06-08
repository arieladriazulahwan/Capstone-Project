import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiLock } from "react-icons/fi";

import Navbar from "../components/Navbar";
import { babList, getBab, getLevels } from "../data/levelMap";

const colorClass = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  yellow: "bg-yellow-500",
  pink: "bg-pink-500",
  teal: "bg-teal-500",
  orange: "bg-orange-500",
  indigo: "bg-indigo-500",
  cyan: "bg-cyan-500",
  red: "bg-red-500",
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const mergeProgress = (fallback = {}, current = {}) => {
  const merged = {
    ...fallback,
    ...current,
    levels: {
      ...(fallback.levels || {}),
      ...(current.levels || {}),
    },
  };

  const babKeys = new Set([
    ...Object.keys(fallback.levels || {}),
    ...Object.keys(current.levels || {}),
  ]);

  babKeys.forEach((babKey) => {
    const fallbackLevels = fallback.levels?.[babKey] || {};
    const currentLevels = current.levels?.[babKey] || {};

    merged.levels[babKey] = {
      ...fallbackLevels,
      ...currentLevels,
    };

    Object.keys(fallbackLevels).forEach((levelKey) => {
      const fallbackScore = fallbackLevels[levelKey];
      const currentScore = currentLevels[levelKey];

      if (typeof fallbackScore === "number" && typeof currentScore === "number") {
        merged.levels[babKey][levelKey] = Math.max(fallbackScore, currentScore);
      }
    });
  });

  return merged;
};

function BabLevels() {
  const navigate = useNavigate();
  const { dialect, bab } = useParams();
  const [progress, setProgress] = useState(null);

  const babInfo = getBab(bab);
  const levels = getLevels(bab);
  const buttonColor = colorClass[babInfo?.color] || "bg-green-500";
  const babOrderIndex = babList.findIndex((item) => item.key === bab);
  const babLabel = babOrderIndex >= 0 ? `BAB ${babOrderIndex + 1}` : bab?.toUpperCase();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const userData = data.user || data;
        setProgress(mergeProgress(
          userData.progress || {},
          userData.progressByDialect?.[dialect] || {}
        ));
      })
      .catch((err) => {
        console.log("Gagal ambil progress level:", err);
      });
  }, [dialect]);

  const isLevelUnlocked = (level, index) => {
    // Hanya level pertama dari Bab 1 yang otomatis terbuka tanpa syarat
    if (bab === "bab1" && index === 0) return true;
    
    if (!progress) return false;

    // Logika Ketat: Level 2 dan seterusnya HANYA terbuka jika skor level sebelumnya >= 80%
    if (index > 0) {
      const prevLevel = levels[index - 1];
      const prevScore = progress.levels?.[bab]?.[prevLevel.key];

      if (typeof prevScore === "number" && prevScore >= 80) return true;
      if (prevScore === true) return true; // Kompatibilitas data akun lama

      return false; // Kunci rapat jika belum 80%
    }

    // Untuk level 1 di Bab 2/Bab 3, terbuka jika dari backend sudah mendefinisikannya
    return progress.levels?.[bab]?.[level.key] !== undefined || progress[bab] === true;
  };

  const getLevelScore = (level) => {
    if (!progress) return 0;
    const score = progress.levels?.[bab]?.[level.key];
    if (typeof score === "number") return score;
    if (score === true) return 100; // Kompatibilitas dengan progress sistem lama
    return 0;
  };

  return (
    <div className="genz-bg h-screen overflow-hidden text-sora flex flex-col">
      <Navbar showBackButton backTo="/level" />

      <main className="p-4 max-w-xl mx-auto pb-20 overflow-y-auto overflow-x-hidden flex-1">
        <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora rounded-3xl p-6 mb-6">
          <p className="text-xs font-black text-kaili uppercase tracking-wider mb-1">
            {babLabel}
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-sora mb-1">
            {babInfo?.title || "Level Bab"}
          </h1>
          <p className="text-sm font-bold text-sora/60 mt-1">
            Pilih level untuk membuka materi, latihan, dan quiz.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {levels.map((level, index) => {
            const unlocked = isLevelUnlocked(level, index);

            return (
              <div
                key={level.key}
                className={`rounded-3xl border-2 p-5 flex justify-between items-center gap-3 transition-all ${
                  unlocked ? "bg-white/80 backdrop-blur-md border-sora/10 shadow-soft-sora hover:shadow-md hover:-translate-y-1" : "bg-sora/5 border-sora/5 opacity-70"
                }`}
              >
                <div className="flex-1 pr-2">
                  <p className="font-black text-sora text-lg">
                    Level {index + 1} <span className="text-sm font-bold text-sora/50">- {level.title}</span>
                  </p>
                  <p className="text-sm font-semibold text-sora/60 mt-1">{level.description}</p>
                </div>

                {unlocked ? (
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <div className="w-16 sm:w-24 h-2.5 bg-sora/10 rounded-full overflow-hidden border border-sora/5">
                        <div
                          className="h-full flag-wave transition-all duration-500"
                          style={{ width: `${getLevelScore(level)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-sora/50 font-bold mt-1.5 uppercase tracking-wider">
                        {getLevelScore(level)}% Benar
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/lesson/${dialect}/${bab}/${level.key}`)
                      }
                      className={`${buttonColor} text-white text-sm px-5 py-2.5 rounded-xl font-bold whitespace-nowrap shadow-sm transition-all hover:-translate-y-0.5`}
                    >
                      Mulai
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-sora/40 font-bold px-2 flex items-center gap-1 uppercase tracking-wider">Terkunci <FiLock size={14} /></span>
                )}
              </div>
            );
          })}

          {levels.length === 0 && (
            <div className="bg-white/80 backdrop-blur-md border-2 border-dashed border-sora/20 rounded-3xl p-10 text-center font-bold text-sora/50">
              Level belum tersedia.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default BabLevels;
