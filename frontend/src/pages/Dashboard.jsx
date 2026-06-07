import { HiSparkles } from "react-icons/hi";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";
import OnboardingTour from "../components/OnboardingTour";
import { Skeleton, SkeletonStatGrid, SkeletonList } from "../components/Skeleton";
import { useNavigate } from "react-router-dom";
import { FiFrown, FiHeart, FiTarget } from "react-icons/fi";
import { FaRocket, FaFire, FaTrophy } from "react-icons/fa";

import Leaderboard from "./Leaderboard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Dashboard() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ROOM CODE
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
          `${API_BASE_URL}/api/auth/profile`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );


        if (res.status === 401) {

          localStorage.removeItem("token");
          navigate("/login/siswa");
          return;

        }

      const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          alert("Gagal memuat profil: " + (data.message || "Server Error"));
        navigate("/login/siswa");
          return;
        }

        const userData = data.user || data;
        setUser(userData);

        // Show onboarding for new users
        if (!userData.onboarding_completed) {
          setShowOnboarding(true);
        }

      } catch (err) {

        console.log(err);
        alert("Terjadi kesalahan koneksi saat memuat profil");

      } finally {

        setLoading(false);

      }

    };

    const fetchFavorites = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_BASE_URL}/api/favorites/full`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

      const data = await res.json().catch(() => ([]));
      setFavorites(Array.isArray(data) ? data : []);

      } catch (err) {

        console.log("Gagal ambil favorit:", err);

      }

    };

    fetchFavorites();
    fetchUser();

  }, [navigate]);

  // JOIN ROOM
  const handleJoinRoom = async () => {

    if (!roomCode) {

      alert("Masukkan kode room");
      return;

    }

    try {

      setJoinLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/api/rooms/join/${roomCode}`,
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

  // Onboarding complete handler
  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/auth/onboarding/complete`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
    } catch (err) {
      console.error("Gagal simpan onboarding:", err);
    }
  };

  // Skeleton loading state
  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-cream">
        <Sidebar role="siswa" />
        <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
          <Navbar user={null} />
          <main className="flex-1 px-4 py-6 flex justify-center">
            <div className="w-full max-w-md md:max-w-3xl space-y-5">
              <Skeleton className="h-28 w-full rounded-3xl" />
              <SkeletonStatGrid count={3} />
              <Skeleton className="h-48 w-full rounded-3xl" />
              <SkeletonList count={3} />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen overflow-hidden flex flex-col items-center justify-center bg-cream p-5 text-center">
        <p className="text-sora/60 mb-4">Gagal memuat data pengguna. Sesi mungkin telah berakhir.</p>
        <button onClick={() => navigate("/login/siswa")} className="bg-kaili text-white px-6 py-3 rounded-full font-bold shadow-glow-kaili btn-bouncy">
          Kembali ke Halaman Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden genz-bg text-sora">

      {/* SIDEBAR */}
      <Sidebar role="siswa" />

      {/* RIGHT AREA */}
      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">

        {/* NAVBAR */}
        <Navbar user={user} />

        {/* CONTENT */}
        <main className="flex-1 px-4 py-6 pb-24 md:pb-6 flex justify-center">

          <div className="w-full max-w-md md:max-w-3xl">

            {/* GREETING */}
            <div className="bg-sora relative overflow-hidden rounded-3xl p-7 mb-6 shadow-soft-sora border border-sora/10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(214,163,56,0.15),transparent_30%)]"></div>
              <h2 className="relative font-black text-3xl flex items-center gap-2 mb-2 text-white">
                <span className="inline-flex items-center gap-2">Halo, {user?.name || "User"} <HiSparkles className="text-yellow-400" /></span>
              </h2>
              <p className="relative text-sm text-white/80 font-medium">
                <span className="inline-flex items-center gap-2">Ayo tingkatkan kemampuan Bahasa Kaili-mu hari ini! <FaRocket className="text-kaili" /></span>
              </p>
            </div>

            {/* GAMIFICATION */}
            <div className="bg-white p-5 rounded-3xl shadow-soft-sora mb-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gradient-to-b from-cream to-white rounded-2xl p-4 border border-sora/5 shadow-sm">
                  <p className="text-xs text-sora/50 font-bold mb-1 uppercase tracking-widest">XP</p>
                  <p className="font-black text-sora text-2xl">{user.xp || 0}</p>
                </div>
                <div className="bg-gradient-to-b from-kaili/10 to-white rounded-2xl p-4 border border-kaili/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-kaili/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <p className="text-xs text-kaili/70 font-bold mb-1 uppercase tracking-widest">Level</p>
                  <p className="font-black text-kaili text-2xl">{user.level || 1}</p>
                </div>
                <div className="bg-gradient-to-b from-cream to-white rounded-2xl p-4 border border-sora/5 shadow-sm">
                  <p className="text-xs text-sora/50 font-bold mb-1 uppercase tracking-widest">Streak</p>
                  <p className="font-black text-sora text-2xl">{user.streak || 0} <FaFire className="inline text-orange-500 text-lg" /></p>
                </div>
              </div>

              {/* PROGRESS */}
              <div className="w-full bg-cream rounded-full h-3 mt-4 overflow-hidden">
                <div
                  className="bg-kaili h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${user.xp}%` }}
                ></div>
              </div>

              {/* TITLE */}
              <p className="mt-4 text-sm font-black text-center tracking-widest flex items-center justify-center gap-2 text-kaili">
                <span className="inline-flex items-center gap-2 text-yellow-500"><FaTrophy /> {user.title?.toUpperCase() || "PEMULA"} <FaTrophy /></span>
              </p>
            </div>

            {/* ROOM QUIZ */}
            <div className="bg-white rounded-3xl p-5 mb-5 shadow-soft-sora">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-cream w-14 h-14 rounded-2xl flex items-center justify-center">
                  <FiTarget size={28} className="text-kaili" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-sora">Masuk Room Kuis</h3>
                  <p className="text-sm text-sora/60">Masukkan kode dari guru</p>
                </div>
              </div>

              {/* INPUT */}
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="KODE ROOM"
                className="w-full text-center text-3xl font-black tracking-widest p-5 rounded-2xl bg-cream/50 border-2 border-dashed border-sora/20 mb-5 uppercase outline-none focus:bg-white focus:border-kaili focus:ring-4 focus:ring-kaili/20 transition-all placeholder:text-sora/20"
              />

              {/* BUTTON */}
              <button
                onClick={handleJoinRoom}
                disabled={joinLoading}
                className="w-full bg-kaili text-white p-4 rounded-full font-bold text-lg shadow-glow-kaili btn-bouncy flex items-center justify-center gap-2"
              >
                {joinLoading ? "Memproses..." : <><FaRocket size={20} /> Masuk ke Kuis</>}
              </button>
            </div>



            {/* LEADERBOARD WIDGET */}
            <Leaderboard />

            {/* FAVORIT */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="font-bold text-sora flex items-center gap-2">
                  <FiHeart size={18} className="text-kaili" fill="currentColor" /> Favorit Kamu
                </h3>
              </div>

              {favorites.length === 0 ? (
                <p className="text-sora/60 text-sm flex items-center gap-2 px-1">
                  Belum ada favorit <FiFrown size={16} />
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-3xl shadow-soft-sora flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-sora mb-1">{item.indonesia}</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(item.translations) &&
                            item.translations.map((t, i) => (
                              <span
                                key={i}
                                className="text-sm text-kaili font-semibold bg-cream px-3 py-1 rounded-full"
                              >
                                {t.word}
                              </span>
                            ))}
                        </div>
                      </div>
                      <FiHeart size={20} className="text-kaili flex-shrink-0" fill="currentColor" />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </main>

      </div>

      <BottomNav />

      {/* ONBOARDING TOUR */}
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

    </div>

  );

}

export default Dashboard;
