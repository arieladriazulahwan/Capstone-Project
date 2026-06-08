import { useEffect, useState } from "react";
import { FiCheckCircle, FiEdit3, FiEye, FiEyeOff, FiKey, FiPlus, FiSlash } from "react-icons/fi";
import { FaGraduationCap, FaUserCog } from "react-icons/fa";

import Navbar from "../components/Navbar";
import { Skeleton } from "../components/Skeleton";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import { useToast } from "../components/ToastProvider";
import ConfirmDialog from "../components/ConfirmDialog";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = `${API_BASE_URL}/api/admin`;

function AdminUsers() {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "siswa",
  });

  // Reset password state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filterRole, search]);

  const fetchUser = async () => {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) setUser(await res.json());
  };

  async function fetchUsers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterRole) params.set("role", filterRole);
    if (search) params.set("search", search);

    const res = await fetch(`${API}/users?${params.toString()}`, { headers });
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  // ========== CRUD Handlers ==========

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", username: "", password: "", role: "siswa" });
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name || "",
      username: item.username || "",
      password: "",
      role: item.role || "siswa",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.username.trim()) {
      return alert("Nama dan Username wajib diisi!");
    }

    if (!editItem && !form.password.trim()) {
      return alert("Password wajib diisi untuk pengguna baru!");
    }

    let res;
    if (editItem) {
      res = await fetch(`${API}/users/${editItem.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          role: form.role,
        }),
      });
    } else {
      res = await fetch(`${API}/users`, {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });
    }

    if (res.ok) {
      setShowModal(false);
      fetchUsers();
      showToast(
        editItem
          ? `Data "${form.name}" berhasil diupdate`
          : `Pengguna "${form.name}" berhasil ditambahkan`
      );
    } else {
      const err = await res.json();
      alert(err.message || "Gagal menyimpan");
    }
  };

  const handleBlock = async (userId) => {
    const res = await fetch(`${API}/users/${userId}/block`, {
      method: "PATCH",
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      fetchUsers();
      showToast(data.message);
    }
  };

  const handleDelete = async (userId, name) => {
    setDeleteTarget(null);

    const res = await fetch(`${API}/users/${userId}`, {
      method: "DELETE",
      headers,
    });

    if (res.ok) {
      fetchUsers();
      showToast(`Akun "${name}" berhasil dihapus`, "error");
    }
  };

  // ========== Reset Password ==========

  const openResetPassword = (item) => {
    setResetTarget(item);
    setNewPassword("");
    setShowNewPassword(false);
    setShowResetModal(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      return alert("Password baru minimal 4 karakter!");
    }

    const res = await fetch(`${API}/users/${resetTarget.id}/password`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ newPassword }),
    });

    if (res.ok) {
      setShowResetModal(false);
      showToast(`Password "${resetTarget.name}" berhasil direset`);
    } else {
      const err = await res.json();
      alert(err.message || "Gagal mereset password");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="genz-bg h-[100dvh] overflow-hidden flex overflow-hidden text-sora">
        <Sidebar role="admin" />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar role="admin" user={null} />
          <main className="flex-1 p-4 pb-24 md:p-6">
            <div className="max-w-6xl mx-auto w-full space-y-6">
              <Skeleton className="h-24 w-full rounded-3xl" />
              <Skeleton className="h-16 w-full rounded-3xl" />
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </main>
        </div>
        <BottomNav role="admin" />
      </div>
    );
  }

  return (
    <div className="genz-bg h-[100dvh] overflow-hidden flex overflow-hidden text-sora">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar role="admin" user={user} />
        <main className="flex-1 p-4 pb-24 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">
            {/* HEADER */}
            <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora p-6 sm:p-8 rounded-3xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-sora mb-1">
                  Kelola Pengguna
                </h1>
                <p className="text-sm font-bold text-sora/60 mt-1">
                  {users.length} pengguna terdaftar
                </p>
              </div>
              <button
                onClick={openAdd}
                className="bg-kaili text-white px-5 py-3 rounded-xl font-bold shadow-glow-kaili transition-all hover:-translate-y-1 text-sm flex items-center gap-2"
              >
                <FiPlus size={18} /> Tambah Pengguna
              </button>
            </div>

            {/* FILTERS */}
            <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora rounded-3xl p-4 sm:p-5 mb-6 flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau username..."
                className="flex-1 px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili text-sora font-bold text-sm bg-white/50 focus:bg-white transition-all"
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili text-sora font-bold text-sm bg-white/50 focus:bg-white transition-all w-full md:w-48"
              >
                <option value="">Semua Role</option>
                <option value="siswa">Siswa</option>
                <option value="guru">Guru</option>
              </select>
            </div>

            {/* TABLE */}
            <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora rounded-3xl overflow-hidden">
              {loading ? (
                <div className="p-8 text-center font-bold text-sora/50">Memuat...</div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center font-bold text-sora/50">
                  Tidak ada pengguna ditemukan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm text-sora">
                    <thead className="bg-sora/5 border-b border-sora/10">
                      <tr>
                        <th className="px-5 py-4 text-left font-black text-sora/60 uppercase tracking-wider text-xs">
                          Nama
                        </th>
                        <th className="px-5 py-4 text-left font-black text-sora/60 uppercase tracking-wider text-xs">
                          Username
                        </th>
                        <th className="px-5 py-4 text-center font-black text-sora/60 uppercase tracking-wider text-xs">
                          Role
                        </th>
                        <th className="px-5 py-4 text-center font-black text-sora/60 uppercase tracking-wider text-xs">
                          Status
                        </th>
                        <th className="px-5 py-4 text-center font-black text-sora/60 uppercase tracking-wider text-xs">
                          Terdaftar
                        </th>
                        <th className="px-5 py-4 text-center font-black text-sora/60 uppercase tracking-wider text-xs">
                          Login Terakhir
                        </th>
                        <th className="px-5 py-4 text-center font-black text-sora/60 uppercase tracking-wider text-xs w-64">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sora/10">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-sora/5 transition-colors">
                          <td className="px-5 py-4 font-black text-sora text-base">
                            {u.name}
                          </td>
                          <td className="px-5 py-4 font-bold text-sora/60">
                            @{u.username}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-xl text-xs font-black border ${
                                u.role === "guru"
                                  ? "bg-sora/10 text-sora border-sora/20"
                                  : "bg-kaili/10 text-kaili border-kaili/20"
                              }`}
                            >
                              <span className="flex items-center justify-center gap-1.5 uppercase tracking-wider">{u.role === "guru" ? <><FaUserCog size={14} /> Guru</> : <><FaGraduationCap size={14} /> Siswa</>}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-xl text-xs font-black border uppercase tracking-wider ${
                                u.is_blocked
                                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                                  : "bg-green-500/10 text-green-600 border-green-500/20"
                              }`}
                            >
                              <span className="flex items-center justify-center gap-1">{u.is_blocked ? <><FiSlash size={14} /> Diblokir</> : <><FiCheckCircle size={14} /> Aktif</>}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center text-sora/60 font-bold text-xs">
                            {formatDate(u.created_at)}
                          </td>
                          <td className="px-5 py-4 text-center text-sora/60 font-bold text-xs">
                            {formatDate(u.last_login)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <button
                                onClick={() => openEdit(u)}
                                className="text-xs font-bold px-2 py-1.5 rounded-lg bg-white border-2 border-sora/10 text-sora hover:border-kaili hover:text-kaili shadow-sm transition-all"
                                title="Edit Pengguna"
                              >
                                <FiEdit3 size={16} />
                              </button>
                              <button
                                onClick={() => openResetPassword(u)}
                                className="text-xs font-bold px-2 py-1.5 rounded-lg bg-white border-2 border-sora/10 text-sora hover:border-kaili hover:text-kaili shadow-sm transition-all"
                                title="Reset Password"
                              >
                                <FiKey size={16} />
                              </button>
                              <button
                                onClick={() => handleBlock(u.id)}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border-2 border-sora/10 text-sora hover:border-kaili hover:text-kaili shadow-sm transition-all"
                              >
                                {u.is_blocked ? "Unblokir" : "Blokir"}
                              </button>
                              <button
                                onClick={() => setDeleteTarget(u)}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 border-2 border-red-100 text-red-500 hover:bg-red-500 hover:text-white shadow-sm transition-all"
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

      {/* ============ MODAL TAMBAH / EDIT ============ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sora/80 backdrop-blur-sm p-4">
          <div className="bg-white/90 backdrop-blur-xl border border-sora/10 shadow-soft-sora rounded-3xl w-full max-w-md">
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-black text-sora mb-6">
                <div className="flex items-center gap-2">{editItem ? <><FiEdit3 size={24} className="text-kaili" /> Edit Pengguna</> : <><FiPlus size={24} className="text-kaili" /> Tambah Pengguna</>}</div>
              </h3>

              <div className="space-y-5">
                {/* Nama */}
                <div>
                  <label className="text-xs font-black text-sora/60 uppercase tracking-wider mb-2 block">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili bg-white/50 focus:bg-white text-sora font-bold transition-all text-sm"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="text-xs font-black text-sora/60 uppercase tracking-wider mb-2 block">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili bg-white/50 focus:bg-white text-sora font-bold transition-all text-sm"
                    placeholder="Masukkan username"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-black text-sora/60 uppercase tracking-wider mb-2 block">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili bg-white/50 focus:bg-white text-sora font-bold transition-all text-sm"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                  </select>
                </div>

                {/* Password - hanya tampil saat mode Tambah */}
                {!editItem && (
                  <div>
                    <label className="text-xs font-black text-sora/60 uppercase tracking-wider mb-2 block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili bg-white/50 focus:bg-white text-sora font-bold transition-all text-sm pr-12"
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sora/40 hover:text-sora transition-colors"
                      >
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs font-bold text-sora/50 mt-2">
                      Minimal 4 karakter
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3.5 bg-white border-2 border-sora/10 text-sora rounded-xl text-sm font-bold hover:border-kaili hover:text-kaili transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3.5 bg-kaili text-white rounded-xl text-sm font-bold shadow-glow-kaili transition-all hover:-translate-y-1"
                >
                  {editItem ? "Simpan Perubahan" : "Tambah Pengguna"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL RESET PASSWORD ============ */}
      {showResetModal && resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sora/80 backdrop-blur-sm p-4">
          <div className="bg-white/90 backdrop-blur-xl border border-sora/10 shadow-soft-sora rounded-3xl w-full max-w-sm">
            <div className="p-6 sm:p-8">
                <h3 className="text-xl font-black text-sora mb-1 flex items-center gap-2">
                  <FiKey size={24} className="text-kaili" /> Reset Password
                </h3>
              <p className="text-sm font-bold text-sora/60 mb-6 mt-2">
                Untuk akun{" "}
                <span className="font-black text-sora">
                  {resetTarget.name}
                </span>{" "}
                (@{resetTarget.username})
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-black text-sora/60 uppercase tracking-wider mb-2 block">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili bg-white/50 focus:bg-white text-sora font-bold transition-all text-sm pr-12"
                      placeholder="Masukkan password baru"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sora/40 hover:text-sora transition-colors"
                    >
                      {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs font-bold text-sora/50 mt-2">
                    Minimal 4 karakter
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3.5 bg-white border-2 border-sora/10 text-sora rounded-xl text-sm font-bold hover:border-kaili hover:text-kaili transition-all shadow-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetPassword}
                  className="flex-1 py-3.5 bg-kaili text-white rounded-xl text-sm font-bold shadow-glow-kaili transition-all hover:-translate-y-1"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Pengguna?"
        message={`Akun "${deleteTarget?.name || "ini"}" akan dihapus permanen.`}
        confirmLabel="Hapus Akun"
        onConfirm={() => handleDelete(deleteTarget?.id, deleteTarget?.name)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default AdminUsers;

