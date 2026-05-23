import { useEffect, useState } from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import SidebarAdmin from "../components/SidebarAdmin";
import BottomNavAdmin from "../components/BottomNavAdmin";
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

  const fetchUsers = async () => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col">
        <NavbarAdmin user={user} />
        <main className="flex-1 p-4 pb-24 md:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  👥 Kelola Pengguna
                </h1>
                <p className="text-sm text-gray-500">
                  {users.length} pengguna terdaftar
                </p>
              </div>
              <button
                onClick={openAdd}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl transition-all text-sm"
              >
                ＋ Tambah Pengguna
              </button>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau username..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              >
                <option value="">Semua Role</option>
                <option value="siswa">Siswa</option>
                <option value="guru">Guru</option>
              </select>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Memuat...</div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  Tidak ada pengguna ditemukan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Nama
                        </th>
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Username
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold">
                          Role
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold">
                          Terdaftar
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold">
                          Login Terakhir
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold w-56">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {u.name}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            @{u.username}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                u.role === "guru"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {u.role === "guru" ? "👨‍🏫 Guru" : "🎓 Siswa"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                u.is_blocked
                                  ? "bg-red-50 text-red-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {u.is_blocked ? "🚫 Diblokir" : "✅ Aktif"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-500 text-xs">
                            {formatDate(u.created_at)}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-500 text-xs">
                            {formatDate(u.last_login)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              <button
                                onClick={() => openEdit(u)}
                                className="text-xs font-medium px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                title="Edit Pengguna"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => openResetPassword(u)}
                                className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                                title="Reset Password"
                              >
                                🔑
                              </button>
                              <button
                                onClick={() => handleBlock(u.id)}
                                className={`text-xs font-medium px-2 py-1 rounded-lg transition ${
                                  u.is_blocked
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                }`}
                              >
                                {u.is_blocked ? "Unblokir" : "Blokir"}
                              </button>
                              <button
                                onClick={() => setDeleteTarget(u)}
                                className="text-xs font-medium px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
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

      {/* ============ MODAL TAMBAH / EDIT ============ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editItem ? "✏️ Edit Pengguna" : "＋ Tambah Pengguna"}
              </h3>

              <div className="space-y-4">
                {/* Nama */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    placeholder="Masukkan username"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  >
                    <option value="siswa">🎓 Siswa</option>
                    <option value="guru">👨‍🏫 Guru</option>
                  </select>
                </div>

                {/* Password - hanya tampil saat mode Tambah */}
                {!editItem && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm pr-12"
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Minimal 4 karakter
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                🔑 Reset Password
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Untuk akun{" "}
                <span className="font-semibold text-gray-700">
                  {resetTarget.name}
                </span>{" "}
                (@{resetTarget.username})
              </p>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm pr-12"
                    placeholder="Masukkan password baru"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showNewPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Minimal 4 karakter
                </p>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetPassword}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavAdmin />
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
