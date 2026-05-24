import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpenCheck, Clock3, Plus, Presentation, Sparkles } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import NavbarGuru from "../components/NavbarGuru";
import RoomCard from "../components/RoomCard";

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
      <div className="teacher-page-bg min-h-screen flex items-center justify-center">
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
    <div className="teacher-page-bg min-h-screen bg-gray-100">
      <NavbarGuru user={user} />

      <main className="px-4 py-6 pb-10 flex justify-center">
        <div className="w-full max-w-md md:max-w-4xl">
          <div className="teacher-hero-card rounded-3xl p-5 sm:p-6 mb-5 shadow-xl text-white">
            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
                  <Sparkles size={14} />
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
                <Plus size={20} />
                Buat Room
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-3">
            <div className="teacher-stat-card rounded-2xl bg-white/90 p-4 shadow">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Presentation size={22} />
              </div>
              <p className="text-sm font-semibold text-gray-500">Total Room</p>
              <p className="text-3xl font-black text-gray-900">{activeRooms}</p>
            </div>

            <div className="teacher-stat-card rounded-2xl bg-white/90 p-4 shadow">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
                <Clock3 size={22} />
              </div>
              <p className="text-sm font-semibold text-gray-500">Rata-rata Timer</p>
              <p className="text-3xl font-black text-gray-900">{averageTimer}s</p>
            </div>

            <div className="teacher-stat-card rounded-2xl bg-white/90 p-4 shadow">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <BookOpenCheck size={22} />
              </div>
              <p className="text-sm font-semibold text-gray-500">Room Terbaru</p>
              <p className="truncate text-lg font-black text-gray-900">{latestRoom}</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/guru/buat-room")}
            className="teacher-create-strip mb-5 flex w-full items-center justify-between rounded-3xl p-4 text-left text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <span>
              <span className="block text-sm font-semibold text-blue-50">Aktivitas baru</span>
              <span className="block text-lg font-black">Buat Room Kuis Baru</span>
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Plus size={24} />
            </span>
          </button>

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
                    className="absolute top-4 right-4 md:right-40 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-sm font-semibold transition shadow-sm z-10"
                  >
                    Hapus
                  </button>
                </div>
              ))}

              {rooms.length === 0 && (
                <div className="teacher-empty-state rounded-3xl border border-dashed border-blue-200 bg-white/80 p-8 text-center shadow">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-600">
                    <Presentation size={30} />
                  </div>
                  <h4 className="text-lg font-black text-gray-900">Belum ada room</h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Mulai buat room pertama untuk membagikan kuis ke siswa.
                  </p>
                  <button
                    onClick={() => navigate("/guru/buat-room")}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-600"
                  >
                    <Plus size={18} />
                    Buat Room
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

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
