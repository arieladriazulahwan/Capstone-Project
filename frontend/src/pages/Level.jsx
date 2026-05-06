import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Level() {
  const [user, setUser] = useState(null);
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
        setUser(data.user || data);
      } catch {
        alert("Gagal ambil data");
      }
    };

    fetchUser();
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading level...
      </div>
    );
  }

  // 🔥 Hitung XP progress
  const xp = user.xp || 0;
  const level = user.level || 1;
  const progress = xp % 100;

  // 🎖️ Reward list
  const rewards = [
    { level: 1, title: "Pemula 🌱" },
    { level: 2, title: "Pelajar 📘" },
    { level: 3, title: "Penjelajah 🧭" },
    { level: 5, title: "Ahli 🧠" },
    { level: 10, title: "Master 🏆" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <Sidebar role="siswa" />

      {/* RIGHT AREA */}
      <div className="flex-1 flex flex-col">

        {/* NAVBAR */}
        <Navbar user={user} />

        {/* CONTENT */}
        <main className="flex-1 px-4 py-6 flex justify-center">
          <div className="w-full max-w-md md:max-w-3xl">

            {/* HEADER */}
            <div className="bg-white rounded-2xl p-5 shadow mb-5">
              <h2 className="text-lg font-bold mb-2">
                🎯 Level Kamu
              </h2>

              <div className="flex justify-between text-sm">
                <p>⭐ XP: {xp}</p>
                <p>🏆 Level: {level}</p>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                {100 - progress} XP lagi untuk naik level 🚀
              </p>

              {/* TITLE */}
              <p className="mt-3 text-green-600 font-semibold">
                {user.title}
              </p>
            </div>

            {/* REWARD LIST */}
            <div className="bg-white rounded-2xl p-5 shadow mb-5">
              <h3 className="font-semibold mb-3">
                🎁 Reward Level
              </h3>

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

            {/* 📚 PROGRESS BAB */}
            <div className="bg-white rounded-2xl p-5 shadow mb-5">
              <h3 className="font-semibold mb-3">📚 Progress Belajar</h3>

              <div className="flex flex-col gap-3">

                {/* BAB 1 */}
                <div
                  className={`p-4 rounded-xl border flex justify-between items-center ${
                    user.progress?.bab1
                      ? "bg-green-100 border-green-400"
                      : "bg-gray-100"
                  }`}
                >
                  <div>
                    <p className="font-semibold">Bab 1</p>
                    <p className="text-sm text-gray-500">
                      Sapaan & Perkenalan
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/lesson/bab1")}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Mulai
                  </button>
                </div>

                {/* BAB 2 */}
                <div
                  className={`p-4 rounded-xl border flex justify-between items-center ${
                    user.progress?.bab2
                      ? "bg-blue-100 border-blue-400"
                      : "bg-gray-100"
                  }`}
                >
                  <div>
                    <p className="font-semibold">Bab 2</p>
                    <p className="text-sm text-gray-500">
                      Kosakata Dasar
                    </p>
                  </div>

                  {user.progress?.bab2 ? (
                    <button
                      onClick={() => navigate("/lesson/bab2")}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Mulai
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">🔒 Terkunci</span>
                  )}
                </div>

                {/* BAB 3 */}
                <div
                  className={`p-4 rounded-xl border flex justify-between items-center ${
                    user.progress?.bab3
                      ? "bg-purple-100 border-purple-400"
                      : "bg-gray-100"
                  }`}
                >
                  <div>
                    <p className="font-semibold">Bab 3</p>
                    <p className="text-sm text-gray-500">
                      Kalimat Sederhana
                    </p>
                  </div>

                  {user.progress?.bab3 ? (
                    <button
                      onClick={() => navigate("/lesson/bab3")}
                      className="text-sm bg-purple-500 text-white px-3 py-1 rounded"
                    >
                      Mulai
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">🔒 Terkunci</span>
                  )}
                </div>

              </div>
            </div>

            {/* NEXT TARGET */}
            <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 mb-5">
              <p className="text-sm text-yellow-700 mb-2">
                🎯 Target Selanjutnya
              </p>

              <p className="font-semibold">
                Capai Level {level + 1}
              </p>

              <p className="text-sm text-gray-600">
                Selesaikan quiz & latihan untuk mendapatkan XP
              </p>
            </div>

            {/* TIPS */}
            <div className="bg-white rounded-2xl p-5 shadow mb-20">
              <h3 className="font-semibold mb-3">
                💡 Cara Cepat Naik Level
              </h3>

              <ul className="text-sm text-gray-600 space-y-2">
                <li>✅ Selesaikan Quiz</li>
                <li>✅ Ikuti Latihan Interaktif</li>
                <li>🔥 Login setiap hari (streak)</li>
                <li>🎯 Masuk room kuis</li>
              </ul>
            </div>

          </div>
        </main>
      </div>

      {/* MOBILE NAV */}
      <BottomNav role="siswa" />
    </div>
  );
}

export default Level;