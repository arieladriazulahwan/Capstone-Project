import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // 🔥 ROOM CODE
  const [roomCode, setRoomCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {

    const fetchUser = async () => {

      try {

        const token = localStorage.getItem("token");

        if (!token) {

          navigate("/login/siswa");
          return;

        }

        const res = await fetch(
          "http://localhost:3000/api/auth/profile",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

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

        const res = await fetch(
          "http://localhost:3000/api/favorites/full",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await res.json();

        setFavorites(data);

      } catch (err) {

        console.log("Gagal ambil favorit:", err);

      }

    };

    fetchFavorites();
    fetchUser();

  }, [navigate]);

  // ========================================
  // 🚀 JOIN ROOM
  // ========================================

  const handleJoinRoom = async () => {

    if (!roomCode) {

      alert("Masukkan kode room");
      return;

    }

    try {

      setJoinLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3000/api/rooms/join/${roomCode}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {

        navigate(`/quiz/${data.room_code}`);

      } else {

        alert(data.message || "Kode room tidak ditemukan");

      }

    } catch (err) {

      console.log(err);
      alert("Gagal masuk room");

    } finally {

      setJoinLoading(false);

    }

  };

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

              {/* PROGRESS */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">

                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${user.xp}%` }}
                ></div>

              </div>

              {/* TITLE */}
              <p className="mt-2 text-sm text-green-600 font-semibold">
                {user.title}
              </p>

            </div>

            {/* ROOM QUIZ */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-3xl p-5 mb-5 shadow-lg">

              <div className="flex items-center gap-3 mb-4">

                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow">
                  🎯
                </div>

                <div>

                  <h3 className="font-bold text-lg text-gray-800">
                    Masuk Room Kuis
                  </h3>

                  <p className="text-sm text-yellow-900">
                    Masukkan kode dari guru
                  </p>

                </div>

              </div>

              {/* INPUT */}
              <input
                type="text"
                value={roomCode}
                onChange={(e) =>
                  setRoomCode(
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="KAILI1"
                className="w-full text-center text-2xl font-bold tracking-widest p-4 rounded-2xl border-2 border-yellow-200 mb-4 uppercase outline-none focus:border-yellow-500"
              />

              {/* BUTTON */}
              <button
                onClick={handleJoinRoom}
                disabled={joinLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 transition text-white p-4 rounded-2xl font-bold text-lg shadow"
              >

                {joinLoading
                  ? "Memproses..."
                  : "🚀 Masuk ke Kuis"}

              </button>

            </div>

            {/* STATS */}
            <div className="bg-white rounded-2xl p-5 shadow mb-5">

              <h2 className="text-lg font-bold mb-2">
                Statistik Belajar Room
              </h2>
              <div className="flex gap-4">

                <div className="flex-1 bg-green-100 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-600">
                    Total Kuis
                  </p>
                  <p className="font-bold text-2xl">
                    {user.total_quizzes || 0}
                  </p>
                </div>
                <div className="flex-1 bg-yellow-100 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-600">
                    Total Poin
                  </p>
                  <p className="font-bold text-2xl">
                    {user.total_points || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* FAVORIT */}
            <div className="mb-20">

              <div className="flex justify-between items-center mb-3">

                <h3 className="font-semibold">
                  ❤️ Favorit Kamu
                </h3>

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

                        <p className="font-semibold">
                          {item.indonesia}
                        </p>

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
