import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../components/NavbarAdmin";
import SidebarAdmin from "../components/SidebarAdmin";
import BottomNavAdmin from "../components/BottomNavAdmin";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function UsageLineChart({ data = [] }) {
  const width = 720;
  const height = 260;
  const padding = { top: 24, right: 24, bottom: 42, left: 44 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.activeUsers || 0, item.roomAttempts || 0])
  );
  const xFor = (index) =>
    padding.left + (data.length <= 1 ? 0 : (index / (data.length - 1)) * plotWidth);
  const yFor = (value) =>
    padding.top + plotHeight - (Number(value || 0) / maxValue) * plotHeight;
  const lineFor = (key) =>
    data.map((item, index) => `${xFor(index)},${yFor(item[key])}`).join(" ");
  const formatDate = (value) =>
    new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  const yTicks = [0, Math.ceil(maxValue / 2), maxValue];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-800">Grafik Penggunaan</h3>
          <p className="text-sm text-gray-500">Aktivitas 7 hari terakhir</p>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <span className="flex items-center gap-2 text-purple-700">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            Pengguna aktif
          </span>
          <span className="flex items-center gap-2 text-green-700">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            Pengerjaan room
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[640px] w-full h-auto">
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={yFor(tick)}
                y2={yFor(tick)}
                stroke="#e5e7eb"
              />
              <text
                x={padding.left - 10}
                y={yFor(tick) + 4}
                textAnchor="end"
                fontSize="12"
                fill="#64748b"
              >
                {tick}
              </text>
            </g>
          ))}

          <polyline
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={lineFor("activeUsers")}
          />
          <polyline
            fill="none"
            stroke="#22c55e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={lineFor("roomAttempts")}
          />

          {data.map((item, index) => (
            <g key={item.date}>
              <circle cx={xFor(index)} cy={yFor(item.activeUsers)} r="5" fill="#8b5cf6" />
              <circle cx={xFor(index)} cy={yFor(item.roomAttempts)} r="5" fill="#22c55e" />
              <text
                x={xFor(index)}
                y={height - 14}
                textAnchor="middle"
                fontSize="12"
                fill="#64748b"
              >
                {formatDate(item.date)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function DashboardAdmin() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      const [userRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: "Bearer " + token },
        }),
        fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: { Authorization: "Bearer " + token },
        }),
      ]);

      if (userRes.ok) setUser(await userRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    };

    fetchData();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Siswa",
      value: stats?.totalSiswa || 0,
      icon: "🎓",
      color: "from-green-500 to-emerald-600",
      bgLight: "bg-green-50",
      path: "/admin/users",
    },
    {
      label: "Total Guru",
      value: stats?.totalGuru || 0,
      icon: "👨‍🏫",
      color: "from-blue-500 to-cyan-600",
      bgLight: "bg-blue-50",
      path: "/admin/users",
    },
    {
      label: "Kosakata",
      value: stats?.totalVocab || 0,
      icon: "📚",
      color: "from-purple-500 to-violet-600",
      bgLight: "bg-purple-50",
      path: "/admin/kamus",
    },
    {
      label: "Soal Kuis",
      value: stats?.totalQuiz || 0,
      icon: "📝",
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
      path: "/admin/materi",
    },
    {
      label: "Room Kelas",
      value: stats?.totalRooms || 0,
      icon: "🏠",
      color: "from-rose-500 to-pink-600",
      bgLight: "bg-rose-50",
      path: "/admin/rooms",
    },
  ];

  const quickActions = [
    {
      title: "Kelola Kamus",
      desc: "Tambah, edit, hapus kosakata",
      icon: "📚",
      path: "/admin/kamus",
      color: "border-purple-200 hover:border-purple-400 hover:shadow-purple-100",
    },
    {
      title: "Kelola Materi & Kuis",
      desc: "Input materi pelajaran & soal",
      icon: "📖",
      path: "/admin/materi",
      color: "border-amber-200 hover:border-amber-400 hover:shadow-amber-100",
    },
    {
      title: "Kelola Pengguna",
      desc: "Blokir atau hapus akun",
      icon: "👥",
      path: "/admin/users",
      color: "border-blue-200 hover:border-blue-400 hover:shadow-blue-100",
    },
    {
      title: "Moderasi Room",
      desc: "Lihat & hapus room kelas",
      icon: "🏠",
      path: "/admin/rooms",
      color: "border-rose-200 hover:border-rose-400 hover:shadow-rose-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col min-w-0">
        <NavbarAdmin user={user} />

        <main className="flex-1 p-4 pb-24 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">
            {/* GREETING */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-6 mb-6 shadow-lg shadow-purple-500/20">
              <h2 className="font-bold text-xl mb-1">
                Selamat datang, {user.name} 👋
              </h2>
              <p className="text-purple-200 text-sm">
                Kelola platform Sora Kaili dari satu tempat
              </p>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {statCards.map((card, i) => (
                <div
                  key={i}
                  onClick={() => navigate(card.path)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg ${card.bgLight} flex items-center justify-center text-base group-hover:scale-110 transition-transform`}
                    >
                      {card.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {card.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {card.label}
                  </div>
                </div>
              ))}
            </div>

            <UsageLineChart data={stats?.usageTrend || []} />

            {/* QUICK ACTIONS */}
            <h3 className="font-bold text-lg text-gray-800 mb-3">
              ⚡ Aksi Cepat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickActions.map((action, i) => (
                <div
                  key={i}
                  onClick={() => navigate(action.path)}
                  className={`bg-white rounded-xl p-5 border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${action.color}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{action.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-500">{action.desc}</p>
                    </div>
                    <div className="ml-auto text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <BottomNavAdmin />
    </div>
  );
}

export default DashboardAdmin;
