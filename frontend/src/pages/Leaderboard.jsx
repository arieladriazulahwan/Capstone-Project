import { useState, useEffect } from "react";

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
      <h2 className="text-2xl font-bold text-yellow-500 mb-4 flex items-center gap-3">
        🏆 Papan Peringkat
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 py-4">Memuat peringkat...</p>
      ) : (
        <div className="bg-white rounded-3xl shadow overflow-hidden border border-gray-100">
          {leaders.length > 0 ? (
            <>
            {displayedLeaders.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center p-4 border-b border-gray-100 last:border-0 ${
                  index === 0 ? "bg-yellow-50" : index === 1 ? "bg-gray-50" : index === 2 ? "bg-orange-50" : "bg-white"
                }`}
              >
                <div className="w-10 text-center font-bold text-xl mr-3">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{user.name}</h3>
                  <p className="text-xs text-gray-500">Level {user.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-yellow-500">{user.xp} XP</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5 bg-gray-100 inline-block px-2 py-0.5 rounded-md">{user.title}</p>
                </div>
              </div>
            ))
            }
            {leaders.length > 5 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-3 text-sm font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition"
              >
                {isExpanded ? "Tampilkan Lebih Sedikit ⬆️" : "Tampilkan Selengkapnya ⬇️"}
              </button>
            )}
            </>
          ) : (
            <p className="text-center p-8 text-gray-500">Belum ada data peringkat.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;