import { useEffect, useState } from "react";

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
    <div className="mt-8 mb-8">
      <div className="student-hero-card mb-4 rounded-3xl p-5 shadow">
        <p className="text-sm font-semibold text-yellow-700">Kompetisi</p>
        <h2 className="text-2xl font-bold text-gray-900">
          Papan Peringkat
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Lihat posisi belajar berdasarkan XP dan level.
        </p>
      </div>

      {loading ? (
        <div className="student-glass-card rounded-3xl p-6 text-center text-gray-500">
          Memuat peringkat...
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow overflow-hidden border border-gray-100">
          {leaders.length > 0 ? (
            <>
              {displayedLeaders.map((user, index) => (
                <div
                  key={user.id}
                  className={`leaderboard-row flex items-center p-4 border-b border-gray-100 last:border-0 ${
                    index === 0
                      ? "bg-yellow-50"
                      : index === 1
                      ? "bg-gray-50"
                      : index === 2
                      ? "bg-orange-50"
                      : "bg-white"
                  }`}
                >
                  <div
                    className={`leaderboard-rank w-10 h-10 rounded-2xl flex items-center justify-center text-center font-bold text-sm mr-3 ${
                      index === 0
                        ? "bg-yellow-200 text-yellow-800"
                        : index === 1
                        ? "bg-gray-200 text-gray-700"
                        : index === 2
                        ? "bg-orange-200 text-orange-800"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    #{index + 1}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{user.name}</h3>
                    <p className="text-xs text-gray-500">Level {user.level}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-yellow-500">{user.xp} XP</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 bg-gray-100 inline-block px-2 py-0.5 rounded-md">
                      {user.title}
                    </p>
                  </div>
                </div>
              ))}

              {leaders.length > 5 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full p-3 text-sm font-bold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition"
                >
                  {isExpanded ? "Tampilkan Lebih Sedikit" : "Tampilkan Selengkapnya"}
                </button>
              )}
            </>
          ) : (
            <p className="text-center p-8 text-gray-500">
              Belum ada data peringkat.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
