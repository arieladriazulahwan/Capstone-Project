import { useEffect, useState } from "react";
import { FiBarChart2, FiClipboard, FiFileText, FiTrash2, FiX } from "react-icons/fi";

import Navbar from "../components/Navbar";
import { Skeleton } from "../components/Skeleton";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
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
      <div className="genz-bg h-screen overflow-hidden flex overflow-hidden text-sora">
        <Sidebar role="admin" />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar role="admin" user={null} />
          <main className="flex-1 p-4 pb-24 md:p-6">
            <div className="max-w-6xl mx-auto w-full space-y-6">
              <Skeleton className="h-28 w-full rounded-3xl" />
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </main>
        </div>
        <BottomNav role="admin" />
      </div>
    );
  }

  return (
    <div className="genz-bg h-screen overflow-hidden flex overflow-hidden text-sora">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar role="admin" user={user} />
        <main className="flex-1 p-4 pb-24 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">
            {/* HEADER */}
            <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora p-6 sm:p-8 rounded-3xl mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-sora mb-1">
                Moderasi Room Kelas
              </h1>
              <p className="text-sm font-bold text-sora/60 mt-1">
                {rooms.length} room terdaftar dari semua guru
              </p>
            </div>

            {/* TABLE */}
            <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora rounded-3xl overflow-hidden">
              {loading ? (
                <div className="p-8 text-center font-bold text-sora/50">Memuat...</div>
              ) : rooms.length === 0 ? (
                <div className="p-8 text-center font-bold text-sora/50">
                  Belum ada room kelas
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm text-sora">
                    <thead className="bg-sora/5 border-b border-sora/10">
                      <tr>
                        <th className="px-5 py-4 text-left font-black text-sora/60 uppercase tracking-wider text-xs">
                          Judul Room
                        </th>
                        <th className="px-5 py-4 text-center font-black text-sora/60 uppercase tracking-wider text-xs">
                          Kode
                        </th>
                        <th className="px-5 py-4 text-center font-black text-sora/60 uppercase tracking-wider text-xs">
                          Kategori
                        </th>
                        <th className="px-5 py-4 text-center font-black text-sora/60 uppercase tracking-wider text-xs">
                          Soal
                        </th>
                        <th className="px-5 py-4 text-center font-black text-sora/60 uppercase tracking-wider text-xs">
                          Percobaan
                        </th>
                        <th className="px-5 py-4 text-center font-black text-sora/60 uppercase tracking-wider text-xs w-40">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sora/10">
                      {rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-sora/5 transition-colors">
                          <td className="px-5 py-4 font-black text-sora">
                            {room.title}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="bg-kaili/10 border border-kaili/20 text-kaili px-3 py-1.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider">
                              {room.code}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center font-bold text-sora/60">
                            {room.category || "-"}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="bg-sora/10 border border-sora/20 text-sora px-3 py-1.5 rounded-xl text-xs font-black">
                              {room.total_questions || 0}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 px-3 py-1.5 rounded-xl text-xs font-black">
                              {room.total_attempts || 0}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => viewDetail(room.id)}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border-2 border-sora/10 text-sora hover:border-kaili hover:text-kaili shadow-sm transition-all"
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => setDeleteTarget(room)}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-500 border-2 border-red-100 hover:bg-red-500 hover:text-white shadow-sm transition-all"
                              >
                                Hapus
                              </button>
                            </div>
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
      <BottomNav role="admin" />

      {/* DETAIL MODAL */}
      {showDetail && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sora/80 backdrop-blur-sm p-4">
          <div className="bg-white/90 backdrop-blur-xl border border-sora/10 shadow-soft-sora rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-sora flex items-center">
                  <FiClipboard size={24} className="inline mr-2 text-kaili" /> Detail Room
                </h3>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-2 hover:bg-sora/5 rounded-xl text-sora/60 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Room Info */}
              <div className="bg-sora/5 border border-sora/10 rounded-2xl p-5 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-black text-sora/50 uppercase tracking-wider">Judul</span>
                    <p className="font-black text-sora text-base">
                      {selectedRoom.title}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-black text-sora/50 uppercase tracking-wider">Kode</span>
                    <p className="font-mono font-black text-kaili text-base">
                      {selectedRoom.code}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-black text-sora/50 uppercase tracking-wider">Kategori</span>
                    <p className="font-bold text-sora text-base">
                      {selectedRoom.category || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-black text-sora/50 uppercase tracking-wider">Timer</span>
                    <p className="font-bold text-sora text-base">
                      {selectedRoom.timer
                        ? `${selectedRoom.timer} detik`
                        : "Tidak ada"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <h4 className="font-black text-sora mb-3 text-sm flex items-center gap-2 uppercase tracking-wider">
                <FiFileText size={18} className="text-kaili" /> Soal ({selectedRoom.questions?.length || 0})
              </h4>
              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-2">
                {selectedRoom.questions?.map((q, i) => (
                  <div
                    key={i}
                    className="bg-sora/5 border border-sora/5 px-4 py-3 rounded-xl text-sm font-bold text-sora"
                  >
                    <span className="font-black text-kaili mr-2">
                      {i + 1}.
                    </span>
                    {q.question || "(Tidak ada teks)"}
                  </div>
                )) || (
                  <p className="text-sora/50 text-sm font-bold">Tidak ada soal</p>
                )}
              </div>

              {/* Attempts */}
              <h4 className="font-black text-sora mb-3 text-sm flex items-center gap-2 uppercase tracking-wider">
                <FiBarChart2 size={18} className="text-kaili" /> Riwayat Percobaan ({selectedRoom.attempts?.length || 0})
              </h4>
              {selectedRoom.attempts?.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {selectedRoom.attempts.map((a, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-sora/5 border border-sora/5 px-4 py-3 rounded-xl text-sm"
                    >
                      <span className="font-black text-sora">{a.student_name}</span>
                      <span className="font-black text-kaili bg-kaili/10 px-3 py-1 rounded-lg">
                        {a.score}/{a.total}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sora/50 text-sm font-bold">
                  Belum ada percobaan
                </p>
              )}

              {/* Delete */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex-1 py-3.5 bg-white border-2 border-sora/10 text-sora rounded-xl text-sm font-bold hover:border-kaili hover:text-kaili transition-all shadow-sm"
                >
                  Tutup
                </button>
                <button
                  onClick={() =>
                    setDeleteTarget(selectedRoom)
                  }
                  className="flex-1 py-3.5 bg-red-50 text-red-500 border-2 border-red-100 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <FiTrash2 size={18} className="inline mr-2" /> Hapus Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

