import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

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

        const res = await fetch("http://localhost:3000/api/auth/profile", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await res.json();
        const userData = data.user || data;

        setUser(userData);

        if (userData?.dialect && !localStorage.getItem("dialect_initialized")) {
          setDialect(userData.dialect);
          localStorage.setItem("dialect_initialized", "true");
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

        const res = await fetch("http://localhost:3000/api/auth/profile", {
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

  const babList = [
    { key: "bab1", label: "Bab 1", title: "Kata benda", color: "green" },
    { key: "bab2", label: "Bab 2", title: "Kata kerja", color: "blue" },
    { key: "bab3", label: "Bab 3", title: "Kata sifat", color: "purple" },
    { key: "bab4", label: "Bab 4", title: "Kata keterangan", color: "yellow" },
    { key: "bab5", label: "Bab 5", title: "Kata ganti", color: "pink" },
    { key: "bab6", label: "Bab 6", title: "Kata depan", color: "indigo" },
    { key: "bab7", label: "Bab 7", title: "Kata sambung", color: "teal" },
    { key: "bab8", label: "Bab 8", title: "Kata bilangan", color: "orange" },
    { key: "bab9", label: "Bab 9", title: "Kata seru", color: "red" },
    { key: "bab10", label: "Bab 10", title: "Kata Sandang", color: "cyan" },
  ];

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
      await fetch("http://localhost:3000/api/auth/dialect", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ dialect: d }),
      });

      setDialect(d);
    } catch {
      console.log("Gagal ubah dialek");
    }
  };

  const dialects = ["ledo", "rai"];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="siswa" />

      <div className="flex-1 flex flex-col">
        <Navbar user={user} />

        <main className="flex-1 px-4 pt-6 pb-28 md:pb-6 flex justify-center">
          <div className="w-full max-w-md md:max-w-3xl">
            <div className="bg-white rounded-2xl p-5 shadow mb-5">
              <h2 className="text-lg font-bold mb-2">Level Kamu</h2>

              <div className="flex justify-between text-sm">
                <p>XP: {xp}</p>
                <p>Level: {level}</p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                {100 - progress} XP lagi untuk naik level
              </p>

              <p className="mt-3 text-green-600 font-semibold">{user.title}</p>
            </div>

            <div className="flex gap-2 mt-4">
              {dialects.map((d) => (
                <button
                  key={d}
                  onClick={() => changeDialect(d)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    dialect === d
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-600"
                  }`}
                >
                  {d.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow mb-5">
              <h3 className="font-semibold mb-3">Reward Level</h3>

              <div className="flex flex-col gap-3">
                {rewards.map((r, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex justify-between ${
                      level >= r.level
                        ? "bg-green-100 border-green-400"
                        : "bg-gray-100"
                    }`}
                  >
                    <span>Level {r.level}</span>
                    <span>{r.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow mb-5">
              <h3 className="font-semibold mb-3">
                Peta Belajar - Dialek {dialect.toUpperCase()}
              </h3>

              <div className="flex flex-col gap-3">
                {babList.map((bab) => {
                  const isUnlocked = Boolean(user.progress?.[bab.key]);
                  const classes = colorClass[bab.color];

                  return (
                    <div
                      key={bab.key}
                      className={`p-4 rounded-xl border flex justify-between items-center ${
                        isUnlocked ? classes.unlocked : "bg-gray-100"
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{bab.label}</p>
                        <p className="text-sm text-gray-500">{bab.title}</p>
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => navigate(`/lesson/${dialect}/${bab.key}`)}
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

            <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 mb-5">
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
