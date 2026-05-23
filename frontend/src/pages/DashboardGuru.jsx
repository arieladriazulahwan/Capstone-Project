import { useEffect, useState } from "react";
import NavbarGuru from "../components/NavbarGuru";
import RoomCard from "../components/RoomCard";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function DashboardGuru() {

  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const navigate = useNavigate();

  // ========================================
  // 🔐 GET USER
  // ========================================

  useEffect(() => {

    const fetchUser = async () => {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/api/auth/profile`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data);
      } else {
        console.error("Failed to fetch user:", res.status);
        // Handle error, perhaps redirect to login
      }

    };

    fetchUser();

  }, []);

  // ========================================
  // 📥 GET ROOM
  // ========================================

  useEffect(() => {

    const fetchRooms = async () => {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/api/rooms`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

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

  // ========================================
  // 🗑️ DELETE ROOM
  // ========================================

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
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <NavbarGuru user={user} />

      <main className="px-4 py-6 flex justify-center">

        <div className="w-full max-w-md md:max-w-4xl">

            {/* GREETING */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-2xl p-5 mb-5 shadow">
              <h2 className="font-bold text-lg">
                Selamat datang, {user.name} 👋
              </h2>

              <p className="text-sm">
                Buat room kuis dan bagikan kode ke siswa
              </p>
            </div>

            {/* BUTTON */}
            <button
              onClick={() => navigate("/guru/buat-room")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-4 shadow font-bold mb-5"
            >
              ＋ Buat Room Kuis Baru
            </button>

            {/* ROOM LIST */}
            <div>

              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">
                  🏠 Room Kuis Saya
                </h3>

                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {rooms.length} room
                </span>
              </div>

              <div className="flex flex-col gap-3">

                {rooms.map((room) => (
                  <div key={room.id} className="relative">
                    <RoomCard room={room} />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteTarget(room);
                      }}
                      className="absolute top-4 right-40 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1 rounded-lg text-sm font-semibold transition shadow-sm z-10"
                    >
                      Hapus
                    </button>
                  </div>
                ))}

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
