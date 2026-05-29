import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { babList } from "../data/levelMap";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Level() {
  const [user, setUser] = useState(null);
  const [dialect, setDialect] = useState("ledo");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login/siswa");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await res.json();
        const userData = data.user || data;

        setUser(userData);

        const savedDialect = localStorage.getItem("selected_dialect") || userData?.dialect;
        if (savedDialect) {
          setDialect(savedDialect);
        }
      } catch {
        alert("Gagal ambil data");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchUserByDialect = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await res.json();
        const userData = data.user || data;

        setUser(userData);
      } catch (err) {
        console.log("Gagal refresh data:", err);
      }
    };

    const timer = setTimeout(() => {
      fetchUserByDialect();
    }, 300);

    return () => clearTimeout(timer);
  }, [dialect]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading level...
      </div>
    );
  }

  const xp = user.xp || 0;
  const level = user.level || 1;
  const progress = xp % 100;

  const rewards = [
    { level: 1, title: "Pemula" },
    { level: 2, title: "Pelajar" },
    { level: 3, title: "Penjelajah" },
    { level: 5, title: "Ahli" },
    { level: 10, title: "Master" },
  ];
  const activeRewardLevel =
    rewards
      .filter((reward) => level >= reward.level)
      .at(-1)?.level || rewards[0].level;

  const colorClass = {
    green: {
      unlocked: "bg-green-100 border-green-400",
      button: "bg-green-500",
    },
    blue: {
      unlocked: "bg-blue-100 border-blue-400",
      button: "bg-blue-500",
    },
    purple: {
      unlocked: "bg-purple-100 border-purple-400",
      button: "bg-purple-500",
    },
    yellow: {
      unlocked: "bg-yellow-100 border-yellow-400",
      button: "bg-yellow-500",
    },
    pink: {
      unlocked: "bg-pink-100 border-pink-400",
      button: "bg-pink-500",
    },
    indigo: {
      unlocked: "bg-indigo-100 border-indigo-400",
      button: "bg-indigo-500",
    },
    teal: {
      unlocked: "bg-teal-100 border-teal-400",
      button: "bg-teal-500",
    },
    orange: {
      unlocked: "bg-orange-100 border-orange-400",
      button: "bg-orange-500",
    },
    red: {
      unlocked: "bg-red-100 border-red-400",
      button: "bg-red-500",
    },
    cyan: {
      unlocked: "bg-cyan-100 border-cyan-400",
      button: "bg-cyan-500",
    },
  };

  const changeDialect = async (d) => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`${API_BASE_URL}/api/auth/dialect`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ dialect: d }),
      });

      setDialect(d);
      localStorage.setItem("selected_dialect", d);
    } catch {
      console.log("Gagal ubah dialek");
    }
  };

  const dialects = ["ledo", "rai"];

  return (
    <div className="student-page-bg flex min-h-screen bg-gray-100">
      <Sidebar role="siswa" />

      <div className="flex-1 flex flex-col">
        <Navbar user={user} />

        <main className="flex-1 px-4 pt-6 pb-28 md:pb-6 flex justify-center">
          <div className="w-full max-w-md md:max-w-3xl">
            <div className="level-wave-panel level-wave-green bg-white rounded-2xl p-5 shadow mb-5">
              <h2 className="text-lg font-bold mb-2">Level Kamu</h2>

              <div className="flex justify-between text-sm">
                <p>XP: {xp}</p>
                <p>Level: {level}</p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mt-3 overflow-hidden">
                <div
                  className="flag-wave h-4 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                {100 - progress} XP lagi untuk naik level
              </p>

              <p className="mt-3 text-green-600 font-semibold">{user.title}</p>
            </div>

            <div className="level-wave-panel level-wave-soft bg-white rounded-2xl p-5 shadow mb-5">
              <h3 className="font-semibold mb-4">Reward Level</h3>

              <div className="pb-2">
                <div className="relative grid grid-cols-5 items-start gap-1 sm:gap-2 px-1 pt-4">
                  <div className="absolute left-6 right-6 top-7 sm:top-8 h-1 rounded-full bg-gray-200"></div>

                  {rewards.map((r) => {
                    const unlocked = level >= r.level;
                    const current = r.level === activeRewardLevel;

                    return (
                      <div
                        key={r.level}
                        className={`relative rounded-xl border px-0.5 py-2 pt-5 sm:px-2 sm:py-3 sm:pt-7 text-center transition ${
                          current
                            ? "reward-fire-card border-orange-300 bg-orange-50 shadow-md"
                            : unlocked
                            ? "border-green-300 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div
                          className={`absolute left-1/2 top-0 z-10 w-6 h-6 sm:w-8 sm:h-8 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center border-2 sm:border-4 border-white shadow ${
                            current
                              ? "reward-fire"
                              : unlocked
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {current && (
                            <>
                              <span className="absolute -inset-2 rounded-full bg-orange-400 animate-ping opacity-30"></span>
                              <span className="absolute -inset-1 rounded-full bg-yellow-300/50 blur-md"></span>
                            </>
                          )}
                          <span className="reward-fire-icon relative text-[10px] sm:text-sm text-white">
                            {current ? "🔥" : unlocked ? "✓" : r.level}
                          </span>
                        </div>

                        <div>
                          <p className="text-[9px] sm:text-[11px] text-gray-500">Level {r.level}</p>
                          <p
                            className={`text-[10px] sm:text-xs md:text-sm font-bold leading-tight ${
                              current
                                ? "text-orange-700"
                                : unlocked
                                ? "text-green-700"
                                : "text-gray-500"
                            }`}
                          >
                            {r.title}
                          </p>

                          {current && (
                            <span className="mt-1 sm:mt-2 inline-flex rounded-full bg-orange-100 px-1 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-semibold text-orange-700">
                              Aktif
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              {dialects.map((d) => (
                <button
                  key={d}
                  onClick={() => changeDialect(d)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                    dialect === d
                      ? "bg-green-500 text-white border-green-500 shadow"
                      : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                  }`}
                >
                  {d.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="level-wave-panel level-wave-soft bg-white rounded-2xl p-5 shadow mb-5">
              <h3 className="font-semibold mb-3">
                Peta Belajar - Dialek {dialect.toUpperCase()}
              </h3>

              <div className="flex flex-col gap-3">
                {babList.map((bab, index) => {
                  const isUnlocked = Boolean(user.progress?.[bab.key]);
                  const classes = colorClass[bab.color];

                  return (
                    <div
                      key={bab.key}
                      className={`level-bab-card p-4 rounded-xl border flex justify-between items-center ${
                        isUnlocked
                          ? `${classes.unlocked} level-bab-wave level-bab-wave-${bab.color}`
                          : "bg-gray-100"
                      }`}
                    >
                      <div>
                        <p className="font-semibold">BAB {index + 1}</p>
                        <p className="text-sm text-gray-500">{bab.title}</p>
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => navigate(`/level/${dialect}/${bab.key}`)}
                          className={`text-sm ${classes.button} text-white px-3 py-1 rounded`}
                        >
                          Mulai
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Terkunci</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="student-card bg-yellow-100 border border-yellow-300 rounded-2xl p-4 mb-5">
              <p className="text-sm text-yellow-700 mb-2">
                Target Selanjutnya
              </p>

              <p className="font-semibold">Capai Level {level + 1}</p>

              <p className="text-sm text-gray-600">
                Selesaikan quiz & latihan
              </p>
            </div>
          </div>
        </main>
      </div>

      <BottomNav role="siswa" />
    </div>
  );
}

export default Level;
