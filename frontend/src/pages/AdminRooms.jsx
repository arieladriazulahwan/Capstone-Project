import { useEffect, useState } from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import SidebarAdmin from "../components/SidebarAdmin";
import BottomNavAdmin from "../components/BottomNavAdmin";
import ConfirmDialog from "../components/ConfirmDialog";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = `${API_BASE_URL}/api/admin`;

function AdminRooms() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetchUser();
    fetchRooms();
  }, []);

  const fetchUser = async () => {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) setUser(await res.json());
  };

  const fetchRooms = async () => {
    setLoading(true);
    const res = await fetch(`${API}/rooms`, { headers });
    if (res.ok) setRooms(await res.json());
    setLoading(false);
  };

  const viewDetail = async (roomId) => {
    const res = await fetch(`${API}/rooms/${roomId}`, { headers });
    if (res.ok) {
      const data = await res.json();
      setSelectedRoom(data);
      setShowDetail(true);
    }
  };

  const handleDelete = async (roomId) => {
    setDeleteTarget(null);

    const res = await fetch(`${API}/rooms/${roomId}`, {
      method: "DELETE",
      headers,
    });

    if (res.ok) {
      fetchRooms();
      if (showDetail && selectedRoom?.id === roomId) {
        setShowDetail(false);
        setSelectedRoom(null);
      }
      alert("Room berhasil dihapus.");
    } else {
      alert("Gagal menghapus room.");
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col min-w-0">
        <NavbarAdmin user={user} />
        <main className="flex-1 p-4 pb-24 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">
            {/* HEADER */}
            <div className="mb-5">
              <h1 className="text-xl font-bold text-gray-800">
                🏠 Moderasi Room Kelas
              </h1>
              <p className="text-sm text-gray-500">
                {rooms.length} room terdaftar dari semua guru
              </p>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Memuat...</div>
              ) : rooms.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  Belum ada room kelas
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Judul Room
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold">
                          Kode
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold">
                          Kategori
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold">
                          Soal
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold">
                          Percobaan
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold w-40">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {room.title}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                              {room.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-500">
                            {room.category || "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {room.total_questions || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                              {room.total_attempts || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => viewDetail(room.id)}
                              className="text-xs font-medium mr-2 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => setDeleteTarget(room)}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* DETAIL MODAL */}
      {showDetail && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  📋 Detail Room
                </h3>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                  ✕
                </button>
              </div>

              {/* Room Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Judul:</span>
                    <p className="font-semibold text-gray-800">
                      {selectedRoom.title}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Kode:</span>
                    <p className="font-mono font-bold text-purple-700">
                      {selectedRoom.code}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Kategori:</span>
                    <p className="text-gray-800">
                      {selectedRoom.category || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Timer:</span>
                    <p className="text-gray-800">
                      {selectedRoom.timer
                        ? `${selectedRoom.timer} detik`
                        : "Tidak ada"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                📝 Soal ({selectedRoom.questions?.length || 0})
              </h4>
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {selectedRoom.questions?.map((q, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700"
                  >
                    <span className="font-medium text-gray-500 mr-2">
                      {i + 1}.
                    </span>
                    {q.question || "(Tidak ada teks)"}
                  </div>
                )) || (
                  <p className="text-gray-400 text-sm">Tidak ada soal</p>
                )}
              </div>

              {/* Attempts */}
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                📊 Riwayat Percobaan ({selectedRoom.attempts?.length || 0})
              </h4>
              {selectedRoom.attempts?.length > 0 ? (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {selectedRoom.attempts.map((a, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg text-sm"
                    >
                      <span className="text-gray-700">{a.student_name}</span>
                      <span className="font-semibold text-purple-700">
                        {a.score}/{a.total}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  Belum ada percobaan
                </p>
              )}

              {/* Delete */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex-1 py-2.5 border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Tutup
                </button>
                <button
                  onClick={() =>
                    setDeleteTarget(selectedRoom)
                  }
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition"
                >
                  🗑️ Hapus Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <BottomNavAdmin />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Room?"
        message={`Room "${deleteTarget?.title || "ini"}" beserta soal dan riwayat percobaan akan ikut terhapus.`}
        confirmLabel="Hapus Room"
        onConfirm={() => handleDelete(deleteTarget?.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default AdminRooms;
