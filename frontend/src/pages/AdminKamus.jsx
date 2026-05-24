import { useEffect, useState } from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import SidebarAdmin from "../components/SidebarAdmin";
import BottomNavAdmin from "../components/BottomNavAdmin";
import ConfirmDialog from "../components/ConfirmDialog";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = `${API_BASE_URL}/api/admin`;

const CATEGORIES = [
  { value: "kata benda", label: "Kata Benda", color: "bg-blue-50 text-blue-700" },
  { value: "kata kerja", label: "Kata Kerja", color: "bg-green-50 text-green-700" },
  { value: "kata sifat", label: "Kata Sifat", color: "bg-amber-50 text-amber-700" },
  { value: "kata ganti", label: "Kata Ganti", color: "bg-pink-50 text-pink-700" },
  { value: "kata keterangan", label: "Kata Keterangan", color: "bg-indigo-50 text-indigo-700" },
  { value: "kata bilangan", label: "Kata Bilangan", color: "bg-cyan-50 text-cyan-700" },
  { value: "kata seru", label: "Kata Seru", color: "bg-rose-50 text-rose-700" },
];

function AdminKamus() {
  const [user, setUser] = useState(null);
  const [vocabList, setVocabList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDialect, setFilterDialect] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    indonesia: "",
    category: "",
    translations: [{ dialect: "ledo", word: "" }],
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const perPage = 20;

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetchUser();
    fetchVocab();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [search, filterDialect, filterCategory, vocabList]);

  const fetchUser = async () => {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) setUser(await res.json());
  };

  const fetchVocab = async () => {
    setLoading(true);
    const res = await fetch(`${API}/vocab`, { headers });
    if (res.ok) {
      const data = await res.json();
      setVocabList(data);
    }
    setLoading(false);
  };

  const applyFilter = () => {
    let result = [...vocabList];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.indonesia?.toLowerCase().includes(q) ||
          v.translations?.some((t) => t.word?.toLowerCase().includes(q))
      );
    }

    if (filterDialect) {
      result = result.filter((v) =>
        v.translations?.some(
          (t) => t.dialect?.toLowerCase() === filterDialect.toLowerCase()
        )
      );
    }

    if (filterCategory) {
      result = result.filter(
        (v) => v.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    setFiltered(result);
    setPage(1);
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({
      indonesia: "",
      category: "",
      translations: [{ dialect: "ledo", word: "" }],
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      indonesia: item.indonesia || "",
      category: item.category || "",
      translations: item.translations?.length
        ? item.translations.map((t) => ({ ...t }))
        : [{ dialect: "ledo", word: "" }],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.indonesia.trim()) return alert("Field Indonesia wajib diisi!");

    const body = {
      indonesia: form.indonesia,
      category: form.category,
      translations: form.translations.filter((t) => t.word.trim()),
    };

    let res;
    if (editItem) {
      res = await fetch(`${API}/vocab/${editItem.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`${API}/vocab`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    }

    if (res.ok) {
      setShowModal(false);
      fetchVocab();
    } else {
      const err = await res.json();
      alert(err.message || "Gagal menyimpan");
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(null);

    const res = await fetch(`${API}/vocab/${id}`, {
      method: "DELETE",
      headers,
    });

    if (res.ok) {
      fetchVocab();
      alert("Kosakata berhasil dihapus.");
    } else {
      alert("Gagal menghapus kosakata.");
    }
  };

  const addTranslation = () => {
    setForm({
      ...form,
      translations: [...form.translations, { dialect: "ledo", word: "" }],
    });
  };

  const removeTranslation = (index) => {
    setForm({
      ...form,
      translations: form.translations.filter((_, i) => i !== index),
    });
  };

  const updateTranslation = (index, field, value) => {
    const updated = [...form.translations];
    updated[index][field] = value;
    setForm({ ...form, translations: updated });
  };

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  if (!user) {
    return (
      <div className="admin-page-bg min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-bg min-h-screen flex overflow-hidden">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col min-w-0">
        <NavbarAdmin user={user} />
        <main className="flex-1 p-4 pb-24 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">
            {/* HEADER */}
            <div className="admin-hero-card flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 rounded-3xl p-5 text-white shadow-lg shadow-purple-500/20">
              <div>
                <h1 className="text-xl font-bold">Kelola Kamus</h1>
                <p className="text-sm text-purple-100">
                  {vocabList.length} kosakata terdaftar
                </p>
              </div>
              <button
                onClick={openAdd}
                className="px-5 py-2.5 bg-white text-purple-700 rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all text-sm"
              >
                Tambah Kosakata
              </button>
            </div>

            {/* FILTERS */}
            <div className="admin-filter-card flex flex-col md:flex-row gap-3 mb-4 rounded-2xl p-3 shadow-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kosakata..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none admin-input focus:ring-2 focus:ring-purple-400 text-sm"
              />
              <select
                value={filterDialect}
                onChange={(e) => setFilterDialect(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none admin-input focus:ring-2 focus:ring-purple-400 text-sm"
              >
                <option value="">Semua Dialek</option>
                <option value="ledo">Ledo</option>
                <option value="rai">Rai</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none admin-input focus:ring-2 focus:ring-purple-400 text-sm"
              >
                <option value="">Semua Kategori</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* TABLE */}
            <div className="admin-table-card rounded-2xl shadow-sm overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Memuat data...</div>
              ) : paged.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  Tidak ada kosakata ditemukan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Indonesia
                        </th>
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Terjemahan
                        </th>
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Kategori
                        </th>
                        <th className="px-4 py-3 text-center text-gray-600 font-semibold w-32">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paged.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {v.indonesia}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {v.translations?.map((t, i) => (
                              <span
                                key={i}
                                className="inline-block bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-lg mr-1 mb-1"
                              >
                                {t.dialect}: {t.word}
                              </span>
                            ))}
                          </td>
                          <td className="px-4 py-3">
                            {v.category ? (
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                  CATEGORIES.find((c) => c.value === v.category)?.color ||
                                  "bg-gray-50 text-gray-600"
                                }`}
                              >
                                {v.category}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => openEdit(v)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(v)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              🗑️ Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <span className="text-xs text-gray-500">
                    Halaman {page} dari {totalPages} ({filtered.length} data)
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-xs bg-white border rounded-lg disabled:opacity-40 hover:bg-gray-100"
                    >
                      ‹ Prev
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-xs bg-white border rounded-lg disabled:opacity-40 hover:bg-gray-100"
                    >
                      Next ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="admin-glass-card rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editItem ? "✏️ Edit Kosakata" : "＋ Tambah Kosakata"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Bahasa Indonesia
                  </label>
                  <input
                    type="text"
                    value={form.indonesia}
                    onChange={(e) =>
                      setForm({ ...form, indonesia: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border rounded-xl focus:outline-none admin-input focus:ring-2 focus:ring-purple-400 text-sm"
                    placeholder="Contoh: rumah"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Kategori
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border rounded-xl focus:outline-none admin-input focus:ring-2 focus:ring-purple-400 text-sm"
                  >
                    <option value="">— Pilih Kategori —</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Terjemahan
                  </label>
                  {form.translations.map((t, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <select
                        value={t.dialect}
                        onChange={(e) =>
                          updateTranslation(i, "dialect", e.target.value)
                        }
                        className="px-3 py-2 border rounded-xl text-sm focus:outline-none admin-input focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="ledo">Ledo</option>
                        <option value="rai">Rai</option>
                      </select>
                      <input
                        type="text"
                        value={t.word}
                        onChange={(e) =>
                          updateTranslation(i, "word", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none admin-input focus:ring-2 focus:ring-purple-400"
                        placeholder="Kata dalam Kaili"
                      />
                      {form.translations.length > 1 && (
                        <button
                          onClick={() => removeTranslation(i)}
                          className="px-2 text-red-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addTranslation}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                  >
                    ＋ Tambah Terjemahan
                  </button>
                </div>
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
                  {editItem ? "Simpan Perubahan" : "Tambah"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <BottomNavAdmin />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Kosakata?"
        message={`Kosakata "${deleteTarget?.indonesia || "ini"}" akan dihapus permanen.`}
        confirmLabel="Hapus"
        onConfirm={() => handleDelete(deleteTarget?.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default AdminKamus;

