import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckSquare, FiClock, FiPlus, FiMonitor } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import ConfirmDialog from "../components/ConfirmDialog";
import Navbar from "../components/Navbar";
import RoomCard from "../components/RoomCard";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function DashboardGuru() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data);
      } else {
        console.error("Failed to fetch user:", res.status);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/api/rooms`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      } else {
        console.error("Failed to fetch rooms:", res.status);
        setRooms([]);
      }
    };

    fetchRooms();
  }, []);

  const confirmDeleteRoom = async () => {
    const roomId = deleteTarget?.id;
    if (!roomId) return;

    setDeleteTarget(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (res.ok) {
        setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
        alert("Room berhasil dihapus.");
      } else {
        alert("Gagal menghapus room, mungkin ada masalah pada server.");
      }
    } catch (err) {
      console.error("Error deleting room:", err);
      alert("Terjadi kesalahan saat menghapus room");
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen overflow-hidden genz-bg text-sora items-center justify-center">
        <div className="teacher-loading-card rounded-3xl bg-white/90 px-6 py-5 text-center shadow">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          <p className="font-semibold text-gray-700">Memuat dashboard guru...</p>
        </div>
      </div>
    );
  }

  const activeRooms = rooms.length;
  const averageTimer = activeRooms
    ? Math.round(
        rooms.reduce((total, room) => total + (Number(room.timer) || 0), 0) /
          activeRooms
      )
    : 0;
  const latestRoom = rooms[0]?.title || "Belum ada room";

  return (
    <div className="flex h-screen overflow-hidden genz-bg text-sora">
      <Sidebar role="guru" />
      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
        <Navbar role="guru" user={user} />

      <main className="px-4 py-6 pb-10 flex justify-center">
        <div className="w-full max-w-md md:max-w-4xl">
          <div className="teacher-hero-card rounded-3xl p-5 sm:p-6 mb-5 shadow-xl text-white">
            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
                  <HiSparkles size={14} />
                  Ruang Guru
                </div>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                  Selamat datang, {user.name}
                </h2>

                <p className="mt-2 max-w-md text-sm text-blue-50">
                  Buat room kuis, bagikan kode ke siswa, lalu pantau hasilnya dari satu tempat.
                </p>
              </div>

              <button
                onClick={() => navigate("/guru/buat-room")}
                className="teacher-primary-button inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-blue-700 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <FiPlus size={20} />
                Buat Room
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
            <div className="teacher-stat-card rounded-xl sm:rounded-2xl bg-white/90 p-2.5 sm:p-4 shadow flex flex-col items-center text-center">
              <div className="mb-1.5 sm:mb-3 flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-100 text-blue-600">
                <FiMonitor className="w-4 h-4 sm:w-[22px] sm:h-[22px]" />
              </div>
              <p className="text-[10px] sm:text-sm font-semibold text-gray-500 truncate w-full">Total Room</p>
              <p className="text-lg sm:text-3xl font-black text-gray-900">{activeRooms}</p>
            </div>

            <div className="teacher-stat-card rounded-xl sm:rounded-2xl bg-white/90 p-2.5 sm:p-4 shadow flex flex-col items-center text-center">
              <div className="mb-1.5 sm:mb-3 flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-cyan-100 text-cyan-600">
                <FiClock className="w-4 h-4 sm:w-[22px] sm:h-[22px]" />
              </div>
              <p className="text-[10px] sm:text-sm font-semibold text-gray-500 truncate w-full">Rata Timer</p>
              <p className="text-lg sm:text-3xl font-black text-gray-900">{averageTimer}s</p>
            </div>

            <div className="teacher-stat-card rounded-xl sm:rounded-2xl bg-white/90 p-2.5 sm:p-4 shadow flex flex-col items-center text-center">
              <div className="mb-1.5 sm:mb-3 flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-100 text-indigo-600">
                <FiCheckSquare className="w-4 h-4 sm:w-[22px] sm:h-[22px]" />
              </div>
              <p className="text-[10px] sm:text-sm font-semibold text-gray-500 truncate w-full">Room Baru</p>
              <p className="truncate text-xs sm:text-lg font-black text-gray-900 w-full">{latestRoom}</p>
            </div>
          </div>


          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-black text-lg text-gray-900">
                Room Kuis Saya
              </h3>

              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                {rooms.length} room
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {rooms.map((room, index) => (
                <div
                  key={room.id}
                  className="teacher-room-row relative"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <RoomCard room={room} />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteTarget(room);
                    }}
                    className="absolute top-4 right-4 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-sm font-semibold transition shadow-sm z-10"
                  >
                    Hapus
                  </button>
                </div>
              ))}

              {rooms.length === 0 && (
                <div className="teacher-empty-state rounded-3xl border border-dashed border-blue-200 bg-white/80 p-8 text-center shadow">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-600">
                    <FiMonitor size={30} />
                  </div>
                  <h4 className="text-lg font-black text-gray-900">Belum ada room</h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Mulai buat room pertama untuk membagikan kuis ke siswa.
                  </p>
                  <button
                    onClick={() => navigate("/guru/buat-room")}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-600"
                  >
                    <FiPlus size={18} />
                    Buat Room
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      </div>
      <BottomNav role="guru" />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Room?"
        message={`Room "${deleteTarget?.title || "ini"}" akan dihapus permanen.`}
        confirmLabel="Hapus Room"
        onConfirm={confirmDeleteRoom}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default DashboardGuru;
