import { useEffect, useState } from "react";
import { FiEdit3, FiPlus, FiTrash2, FiX } from "react-icons/fi";

import Navbar from "../components/Navbar";
import { Skeleton } from "../components/Skeleton";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
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
      <div className="genz-bg h-screen overflow-hidden flex overflow-hidden text-sora">
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
    <div className="genz-bg h-screen overflow-hidden flex overflow-hidden text-sora">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar role="admin" user={user} />
        <main className="flex-1 p-4 pb-24 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">
            {/* HEADER */}
            <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora p-6 sm:p-8 rounded-3xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-sora mb-1">Kelola Kamus</h1>
                <p className="text-sm font-bold text-sora/60 mt-1">
                  {vocabList.length} kosakata terdaftar
                </p>
              </div>
              <button
                onClick={openAdd}
                className="bg-kaili text-white px-5 py-3 rounded-xl font-bold shadow-glow-kaili transition-all hover:-translate-y-1 text-sm flex items-center gap-2"
              >
                <FiPlus size={18} /> Tambah Kosakata
              </button>
            </div>

            {/* FILTERS */}
            <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora rounded-3xl p-4 sm:p-5 mb-6 flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kosakata..."
                className="flex-1 px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili text-sora font-bold text-sm bg-white/50 focus:bg-white transition-all"
              />
              <select
                value={filterDialect}
                onChange={(e) => setFilterDialect(e.target.value)}
                className="px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili text-sora font-bold text-sm bg-white/50 focus:bg-white transition-all"
              >
                <option value="">Semua Dialek</option>
                <option value="ledo">Ledo</option>
                <option value="rai">Rai</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili text-sora font-bold text-sm bg-white/50 focus:bg-white transition-all"
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
            <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora rounded-3xl overflow-hidden">
              {loading ? (
                <div className="p-8 text-center font-bold text-sora/50">Memuat data...</div>
              ) : paged.length === 0 ? (
                <div className="p-8 text-center font-bold text-sora/50">
                  Tidak ada kosakata ditemukan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm text-sora">
                    <thead className="bg-sora/5 border-b border-sora/10">
                      <tr>
                        <th className="px-5 py-4 text-left font-black text-sora/60 uppercase tracking-wider text-xs">
                          Indonesia
                        </th>
                        <th className="px-5 py-4 text-left font-black text-sora/60 uppercase tracking-wider text-xs">
                          Terjemahan
                        </th>
                        <th className="px-5 py-4 text-left font-black text-sora/60 uppercase tracking-wider text-xs">
                          Kategori
                        </th>
                        <th className="px-5 py-4 text-center font-black text-sora/60 uppercase tracking-wider text-xs w-32">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sora/10">
                      {paged.map((v) => (
                        <tr key={v.id} className="hover:bg-sora/5 transition-colors">
                          <td className="px-5 py-4 font-black text-sora text-base">
                            {v.indonesia}
                          </td>
                          <td className="px-5 py-4">
                            {v.translations?.map((t, i) => (
                              <span
                                key={i}
                                className="inline-block bg-kaili/10 border border-kaili/20 text-kaili text-xs px-2.5 py-1 rounded-xl font-black uppercase tracking-wider mr-1.5 mb-1.5"
                              >
                                {t.dialect}: {t.word}
                              </span>
                            ))}
                          </td>
                          <td className="px-5 py-4">
                            {v.category ? (
                              <span
                                className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black border ${
                                  CATEGORIES.find((c) => c.value === v.category)?.color.replace('bg-', 'bg-opacity-10 border-').replace('text-', 'text-opacity-100 text-') ||
                                  "bg-sora/10 border-sora/20 text-sora"
                                }`}
                              >
                                {v.category}
                              </span>
                            ) : (
                              <span className="text-sora/40 font-bold">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => openEdit(v)}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border-2 border-sora/10 text-sora hover:border-kaili hover:text-kaili shadow-sm transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget(v)}
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

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-sora/10 bg-sora/5">
                  <span className="text-xs font-bold text-sora/60 uppercase tracking-wider">
                    Halaman {page} dari {totalPages} ({filtered.length} data)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-xs font-bold bg-white border-2 border-sora/10 text-sora rounded-xl disabled:opacity-40 hover:border-kaili hover:text-kaili transition-all shadow-sm"
                    >
                      ‹ Prev
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-xs font-bold bg-white border-2 border-sora/10 text-sora rounded-xl disabled:opacity-40 hover:border-kaili hover:text-kaili transition-all shadow-sm"
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
      <BottomNav role="admin" />

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sora/80 backdrop-blur-sm p-4">
          <div className="bg-white/90 backdrop-blur-xl border border-sora/10 shadow-soft-sora rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-black text-sora mb-6">
                <div className="flex items-center gap-2">{editItem ? <><FiEdit3 size={24} className="text-kaili" /> Edit Kosakata</> : <><FiPlus size={24} className="text-kaili" /> Tambah Kosakata</>}</div>
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-black text-sora/60 uppercase tracking-wider mb-2 block">
                    Bahasa Indonesia
                  </label>
                  <input
                    type="text"
                    value={form.indonesia}
                    onChange={(e) =>
                      setForm({ ...form, indonesia: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili bg-white/50 focus:bg-white text-sora font-bold transition-all text-sm"
                    placeholder="Contoh: rumah"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-sora/60 uppercase tracking-wider mb-2 block">
                    Kategori
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili bg-white/50 focus:bg-white text-sora font-bold transition-all text-sm"
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
                  <label className="text-xs font-black text-sora/60 uppercase tracking-wider mb-2 block">
                    Terjemahan
                  </label>
                  {form.translations.map((t, i) => (
                    <div key={i} className="flex gap-2 mb-3">
                      <select
                        value={t.dialect}
                        onChange={(e) =>
                          updateTranslation(i, "dialect", e.target.value)
                        }
                        className="px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili bg-white/50 focus:bg-white text-sora font-bold transition-all text-sm w-32"
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
                        className="flex-1 px-4 py-3 border-2 border-sora/10 rounded-xl focus:outline-none focus:border-kaili bg-white/50 focus:bg-white text-sora font-bold transition-all text-sm"
                        placeholder="Kata dalam Kaili"
                      />
                      {form.translations.length > 1 && (
                        <button
                          onClick={() => removeTranslation(i)}
                          className="px-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <FiX size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addTranslation}
                    className="text-sm text-kaili hover:text-kaili/80 font-black flex items-center gap-1 mt-2 uppercase tracking-wider"
                  >
                    <FiPlus size={16} /> Tambah Terjemahan
                  </button>
                </div>
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
                  {editItem ? "Simpan Perubahan" : "Tambah"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

