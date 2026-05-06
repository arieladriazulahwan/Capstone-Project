import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

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

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login/siswa");
          return;
        }

        setUser(data.user || data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/api/favorites/full", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.log("Gagal ambil favorit:", err);
      }
    };

    fetchFavorites();

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  if (!user) return null;

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

            {/* GREETING */}
          <div className="bg-gradient-to-r from-green-500 to-green-400 text-white rounded-2xl p-5 mb-5 shadow">
            <h2 className="font-bold text-lg">
              Halo, {user?.name || "User"} 👋
            </h2>
            <p className="text-sm">
              Ayo belajar Bahasa Kaili hari ini
            </p>
          </div>

          {/* GAMIFICATION */}
          <div className="bg-white p-4 rounded-xl shadow mb-5">
            <div className="flex justify-between">
              <p>⭐ XP: {user.xp}</p>
              <p>🏆 Level: {user.level}</p>
            </div>

            {/* Progress */}
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${user.xp}%` }}
              ></div>
            </div>

            {/* Title */}
            <p className="mt-2 text-sm text-green-600 font-semibold">
              {user.title}
            </p>
          </div>

          {/* ROOM QUIZ */}
          <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 mb-5">
            <p className="text-sm text-yellow-700 mb-2">
              🎯 Masukkan Kode Room Kuis
            </p>

            <input
              type="text"
              placeholder="KAILI1"
              className="w-full text-center text-xl font-bold tracking-widest p-3 rounded-xl border mb-3"
            />

            <button className="w-full bg-yellow-500 text-white p-3 rounded-xl font-semibold hover:bg-yellow-600">
              Masuk ke Kuis! 🚀
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white rounded-xl p-4 text-center shadow">
              <h3 className="text-green-600 text-xl font-bold">5</h3>
              <p className="text-sm text-gray-500">Kuis Selesai</p>
            </div>

            <div className="bg-white rounded-xl p-4 text-center shadow">
              <h3 className="text-yellow-500 text-xl font-bold">1240</h3>
              <p className="text-sm text-gray-500">Total Poin</p>
            </div>
          </div>

          {/* BADGE */}
          <div className="mb-5">
            <h3 className="font-semibold mb-2">🏅 Badge</h3>

            <div className="flex gap-2 flex-wrap">
              {user?.level >= 1 && (
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                  Beginner
                </span>
              )}
              {user?.level >= 5 && (
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                  Intermediate
                </span>
              )}
              {user?.level >= 10 && (
                <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">
                  Expert
                </span>
              )}
            </div>
          </div>

          {/* ❤️ FAVORIT */}
            <div className="mb-20">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">❤️ Favorit Kamu</h3>
              </div>

              {favorites.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Belum ada favorit 😢
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-xl shadow flex justify-between hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold">{item.indonesia}</p>

                        {/* TRANSLATION */}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Array.isArray(item.translations) &&
                            item.translations.map((t, i) => (
                            <span
                              key={i}
                              className="text-sm text-green-600"
                            >
                              {t.word}
                            </span>
                          ))}
                        </div>
                      </div>

                      <span>❤️</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

      </div>

      {/* MOBILE NAV */}
      <BottomNav role="siswa" />

    </div>
  );
}

export default Dashboard;