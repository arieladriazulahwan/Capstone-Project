import BottomNav from "../components/BottomNav";
import { FaTrophy } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Skeleton } from "../components/Skeleton";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/auth/leaderboard`, {
          headers: { Authorization: "Bearer " + token },
        });

        if (!res.ok) {
          throw new Error(`Gagal mengambil data dari server (Status: ${res.status})`);
        }

        const data = await res.json();
        setLeaders(data);
      } catch (err) {
        console.log("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const displayedLeaders = isExpanded ? leaders : leaders.slice(0, 5);

  return (
    <div className="mt-8 mb-8 relative z-10">
      <div className="bg-kaili/10 border border-kaili/20 mb-4 rounded-3xl p-6 shadow-soft-sora relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-32 h-32 bg-kaili/30 rounded-full blur-2xl"></div>
        <p className="text-sm font-black text-kaili tracking-widest uppercase"><span className="inline-flex items-center gap-2">Kompetisi <FaTrophy className="text-yellow-500" /></span></p>
        <h2 className="text-2xl font-black text-sora mt-1">
          Papan Peringkat
        </h2>
        <p className="mt-1 text-sm text-sora/60 font-medium">
          Lihat posisi belajar berdasarkan XP dan level.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-soft-sora overflow-hidden border border-white/60 transition-all hover:shadow-md">
          {leaders.length > 0 ? (
            <>
              {displayedLeaders.map((user, index) => (
                <div
                  key={user.id}
                  className={`leaderboard-row flex items-center p-4 border-b border-white/40 last:border-0 hover:bg-cream/50 transition-colors ${
                    index === 0
                      ? "bg-amber-100/60"
                      : index === 1
                      ? "bg-slate-100/60"
                      : index === 2
                      ? "bg-orange-100/60"
                      : "bg-transparent"
                  }`}
                >
                  <div
                    className={`leaderboard-rank w-10 h-10 rounded-2xl flex items-center justify-center text-center font-black text-sm mr-3 shadow-sm ${
                      index === 0
                        ? "bg-amber-300 text-amber-900"
                        : index === 1
                        ? "bg-slate-300 text-slate-800"
                        : index === 2
                        ? "bg-orange-300 text-orange-900"
                        : "bg-sora/10 text-sora"
                    }`}
                  >
                    #{index + 1}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-black text-sora">{user.name}</h3>
                    <p className="text-xs text-sora/60 font-medium">Level {user.level}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-kaili">{user.xp} XP</p>
                    <p className="text-[10px] font-bold text-sora/50 mt-0.5 bg-sora/5 border border-sora/10 inline-block px-2 py-0.5 rounded-md">
                      {user.title}
                    </p>
                  </div>
                </div>
              ))}

              {leaders.length > 5 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full p-4 text-sm font-black text-kaili bg-kaili/10 hover:bg-kaili/20 transition-all btn-bouncy"
                >
                  {isExpanded ? "Tampilkan Lebih Sedikit" : "Tampilkan Selengkapnya"}
                </button>
              )}
            </>
          ) : (
            <p className="text-center p-8 text-sora/60 font-medium">
              Belum ada data peringkat.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
