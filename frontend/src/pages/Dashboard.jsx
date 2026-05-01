import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null); // 🔥 ubah jadi null
  const [loading, setLoading] = useState(true);
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
        console.log("PROFILE:", data);

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login/siswa");
          return;
        }

        // 🔥 fleksibel (support data.user atau langsung data)
        setUser(data.user || data);
      } catch (err) {
        console.log(err);
        alert("Gagal ambil data user");
      } finally {
        setLoading(false); // 🔥 anti loading selamanya
      }
    };

    fetchUser();
  }, [navigate]);

  // ⏳ Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // ❌ kalau user tidak ada
  if (!user) return null;

  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* SIDEBAR DESKTOP */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-md md:max-w-3xl">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                🌿
              </div>
              <h1 className="font-bold text-green-600 text-lg">
                Sora Kaili
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm">
                {user?.name}
              </span>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                👨‍🎓
              </div>
            </div>
          </div>

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
          <div className="bg-white rounded-xl p-4 shadow mb-5">
            <div className="flex justify-between text-sm font-medium">
              <p>⭐ XP: {user?.xp || 0}</p>
              <p>🏆 Level: {user?.level || 1}</p>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${(user?.xp || 0) % 100}%` }}
              />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              🔥 Streak: {user?.streak || 0} hari
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

          {/* KOSAKATA */}
          <div className="mb-20">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">📚 Kosakata Pilihan</h3>
              <span className="text-green-600 text-sm cursor-pointer">
                Lihat Semua →
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { indo: "Kayu", kaili: "Kaju" },
                { indo: "Air", kaili: "Ue" },
                { indo: "Rumah", kaili: "Banua" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl shadow flex justify-between hover:bg-gray-50 cursor-pointer"
                >
                  <div>
                    <p className="font-semibold">{item.indo}</p>
                    <p className="text-sm text-green-600">
                      {item.kaili}
                    </p>
                  </div>
                  <span>›</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE NAV */}
      <BottomNav />
    </div>
  );
}

export default Dashboard;