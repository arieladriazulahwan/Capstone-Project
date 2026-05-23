import { useEffect, useState } from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import SidebarAdmin from "../components/SidebarAdmin";
import BottomNavAdmin from "../components/BottomNavAdmin";
import ConfirmDialog from "../components/ConfirmDialog";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = `${API_BASE_URL}/api/admin`;
const MAX_LESSON_IMAGE_SIZE = 50 * 1024 * 1024;

const emptyLessonItem = {
  indo: "",
  kaili: "",
  tipe: "kosakata",
  category: "kata benda",
  image: "",
};

const emptyPracticeItem = {
  category: "kata benda",
  question: "",
  options: ["", "", "", ""],
  answer: "",
  image: "",
};

const lessonCategories = {
  bab1: [
    "kata benda",
    "kata kerja",
    "kata sifat",
    "kata keterangan",
    "kata ganti",
    "kata depan",
    "kata sambung",
    "kata bilangan",
    "kata seru",
    "kata sandang",
  ],
  bab2: [
    "kalimat sederhana",
    "kalimat berita",
    "kalimat tanya",
    "kalimat perintah",
    "kalimat seruan",
    "kalimat tunggal",
    "kalimat majemuk setara",
    "kalimat majemuk bertingkat",
    "kalimat langsung",
    "kalimat tidak langsung",
  ],
  bab3: [
    "Kehidupan Desa dan Masyarakat",
    "Penyakit dan Pengobatan",
    "Sistem Kekerabatan",
    "Bagian Tubuh",
    "Gerak dan Kerja",
    "Tanaman",
    "Kata Tugas",
    "Perangai, Kata sifat, dan Warna",
    "Makanan dan Minuman",
    "Peralatan dan Perlengkapan",
    "Binatang",
    "Kata Ganti, Sapaan",
    "Mata Pencaharian",
    "Permainan",
    "Kata Bilangan",
    "Rumah dan Bagian-bagiannya",
    "Musim, Keadaan Alam",
    "Pakaian dan Perhiasan",
    "Swadesh List",
  ],
};

const getLessonCategories = (bab) =>
  lessonCategories[bab] || [
    "kosakata",
    "kalimat",
    "gambar kosakata",
  ];

function AdminMateri() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("materi"); // materi | quiz
  const [lessons, setLessons] = useState([]);
  const [practiceList, setPracticeList] = useState([]);
  const [quizList, setQuizList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal materi
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    dialect: "ledo",
    bab: "bab1",
    title: "",
    items: [{ ...emptyLessonItem }],
  });
  const [editLesson, setEditLesson] = useState(null);

  // Modal latihan
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceForm, setPracticeForm] = useState({
    dialect: "ledo",
    bab: "bab1",
    items: [{ ...emptyPracticeItem }],
  });
  const [editPractice, setEditPractice] = useState(null);

  // Modal quiz
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    dialect: "ledo",
    bab: "bab1",
  });
  const [editQuiz, setEditQuiz] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetchUser();
    fetchLessons();
    fetchPractices();
    fetchQuiz();
  }, []);

  const fetchUser = async () => {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.ok) setUser(await res.json());
  };

  const fetchLessons = async () => {
    const res = await fetch(`${API}/lessons`, { headers });
    if (res.ok) setLessons(await res.json());
    setLoading(false);
  };

  const fetchQuiz = async () => {
    const res = await fetch(`${API}/quiz`, { headers });
    if (res.ok) setQuizList(await res.json());
  };

  const fetchPractices = async () => {
    const res = await fetch(`${API}/practices`, { headers });
    if (res.ok) setPracticeList(await res.json());
  };

  // ========= MATERI HANDLERS =========
  const openAddLesson = () => {
    setEditLesson(null);
    setLessonForm({
      dialect: "ledo",
      bab: "bab1",
      title: "",
      items: [{ ...emptyLessonItem }],
    });
    setShowLessonModal(true);
  };

  const openEditLesson = async (lesson) => {
    const res = await fetch(`${API}/lessons/${lesson.dialect}/${lesson.bab}`, {
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      setEditLesson(lesson);
      setLessonForm({
        dialect: lesson.dialect,
        bab: lesson.bab,
        title: data.title || "",
        items: Array.isArray(data) && data.length > 0
          ? data.map((item) => ({
              indo: item.indo || item.indonesia || "",
              kaili: item.kaili || item.answer || "",
              tipe: item.tipe || "kosakata",
              category: item.category || getLessonCategories(lesson.bab)[0],
              image: item.image || item.gambar || "",
            }))
          : [{ ...emptyLessonItem, category: getLessonCategories(lesson.bab)[0] }],
      });
      setShowLessonModal(true);
    }
  };

  const saveLesson = async () => {
    const body = lessonForm.items
      .map((item) => ({
        indo: item.indo.trim(),
        kaili: item.kaili.trim(),
        tipe: item.tipe.trim() || "materi",
        category: item.category.trim(),
        image: (item.image || "").trim(),
      }))
      .filter((item) => item.indo && item.kaili && item.category);

    if (body.length === 0) {
      alert("Minimal satu materi harus diisi lengkap.");
      return;
    }

    const res = await fetch(
      `${API}/lessons/${lessonForm.dialect}/${lessonForm.bab}`,
      { method: "PUT", headers, body: JSON.stringify(body) }
    );
    if (res.ok) {
      setShowLessonModal(false);
      fetchLessons();
    } else {
      alert("Gagal menyimpan materi");
    }
  };

  const updateLessonItem = (index, field, value) => {
    setLessonForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addLessonItem = () => {
    setLessonForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...emptyLessonItem,
          tipe: prev.bab === "bab2" ? "kalimat" : prev.bab === "bab3" ? "kosakata" : "kosakata",
          category: getLessonCategories(prev.bab)[0],
        },
      ],
    }));
  };

  const removeLessonItem = (index) => {
    setLessonForm((prev) => ({
      ...prev,
      items:
        prev.items.length > 1
          ? prev.items.filter((_, itemIndex) => itemIndex !== index)
          : prev.items,
    }));
  };

  const handleLessonImage = (index, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      return;
    }

    if (file.size > MAX_LESSON_IMAGE_SIZE) {
      alert("Gambar maksimal 50MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateLessonItem(index, "image", reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const deleteLesson = async (lesson) => {
    setDeleteTarget(null);
    const res = await fetch(`${API}/lessons/${lesson.dialect}/${lesson.bab}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) {
      fetchLessons();
      alert("Materi berhasil dihapus.");
    } else {
      alert("Gagal menghapus materi.");
    }
  };

  // ========= LATIHAN HANDLERS =========
  const openAddPractice = () => {
    setEditPractice(null);
    setPracticeForm({
      dialect: "ledo",
      bab: "bab1",
      items: [{ ...emptyPracticeItem }],
    });
    setShowPracticeModal(true);
  };

  const openEditPractice = async (practice) => {
    const res = await fetch(`${API}/practices/${practice.dialect}/${practice.bab}`, {
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      setEditPractice(practice);
      setPracticeForm({
        dialect: practice.dialect,
        bab: practice.bab,
        items: Array.isArray(data) && data.length > 0
          ? data.map((item) => ({
              category: item.category || getLessonCategories(practice.bab)[0],
              question: item.question || "",
              options: Array.isArray(item.options)
                ? [...item.options, "", "", "", ""].slice(0, 4)
                : ["", "", "", ""],
              answer: item.answer || "",
              image: item.image || "",
            }))
          : [{ ...emptyPracticeItem, category: getLessonCategories(practice.bab)[0] }],
      });
      setShowPracticeModal(true);
    }
  };

  const updatePracticeItem = (index, field, value) => {
    setPracticeForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updatePracticeOption = (itemIndex, optionIndex, value) => {
    setPracticeForm((prev) => ({
      ...prev,
      items: prev.items.map((item, index) => {
        if (index !== itemIndex) return item;
        const options = [...item.options];
        options[optionIndex] = value;
        return { ...item, options };
      }),
    }));
  };

  const addPracticeItem = () => {
    setPracticeForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { ...emptyPracticeItem, category: getLessonCategories(prev.bab)[0] },
      ],
    }));
  };

  const removePracticeItem = (index) => {
    setPracticeForm((prev) => ({
      ...prev,
      items:
        prev.items.length > 1
          ? prev.items.filter((_, itemIndex) => itemIndex !== index)
          : prev.items,
    }));
  };

  const handlePracticeImage = (index, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("File harus berupa gambar.");
    if (file.size > MAX_LESSON_IMAGE_SIZE) return alert("Gambar maksimal 50MB.");

    const reader = new FileReader();
    reader.onloadend = () => updatePracticeItem(index, "image", reader.result || "");
    reader.readAsDataURL(file);
  };

  const savePractice = async () => {
    const body = practiceForm.items
      .map((item) => ({
        category: item.category.trim(),
        question: item.question.trim(),
        options: item.options.map((option) => option.trim()).filter(Boolean),
        answer: item.answer.trim(),
        image: (item.image || "").trim(),
      }))
      .filter((item) => item.category && item.question && item.answer && item.options.length > 0);

    if (body.length === 0) {
      alert("Minimal satu soal latihan harus diisi lengkap.");
      return;
    }

    const res = await fetch(
      `${API}/practices/${practiceForm.dialect}/${practiceForm.bab}`,
      { method: "PUT", headers, body: JSON.stringify(body) }
    );

    if (res.ok) {
      setShowPracticeModal(false);
      fetchPractices();
    } else {
      alert("Gagal menyimpan latihan");
    }
  };

  const deletePractice = async (practice) => {
    setDeleteTarget(null);
    const res = await fetch(`${API}/practices/${practice.dialect}/${practice.bab}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) {
      fetchPractices();
      alert("Latihan berhasil dihapus.");
    } else {
      alert("Gagal menghapus latihan.");
    }
  };

  // ========= QUIZ HANDLERS =========
  const openAddQuiz = () => {
    setEditQuiz(null);
    setQuizForm({
      question: "",
      options: ["", "", "", ""],
      answer: 0,
      dialect: "ledo",
      bab: "bab1",
    });
    setShowQuizModal(true);
  };

  const openEditQuiz = (quiz) => {
    setEditQuiz(quiz);
    setQuizForm({
      question: quiz.question || "",
      options: quiz.options || ["", "", "", ""],
      answer: quiz.answer ?? 0,
      dialect: quiz.dialect || "ledo",
      bab: quiz.bab || "bab1",
    });
    setShowQuizModal(true);
  };

  const saveQuiz = async () => {
    if (!quizForm.question.trim()) return alert("Pertanyaan wajib diisi!");

    const body = {
      question: quizForm.question,
      options: quizForm.options.filter((o) => o.trim()),
      answer: quizForm.answer,
      dialect: quizForm.dialect,
      bab: quizForm.bab,
    };

    let res;
    if (editQuiz) {
      res = await fetch(`${API}/quiz/${editQuiz.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`${API}/quiz`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    }

    if (res.ok) {
      setShowQuizModal(false);
      fetchQuiz();
    } else {
      const err = await res.json();
      alert(err.message || "Gagal menyimpan kuis");
    }
  };

  const deleteQuiz = async (id) => {
    setDeleteTarget(null);
    const res = await fetch(`${API}/quiz/${id}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) {
      fetchQuiz();
      alert("Soal kuis berhasil dihapus.");
    } else {
      alert("Gagal menghapus soal kuis.");
    }
  };

  const updateOption = (index, value) => {
    const updated = [...quizForm.options];
    updated[index] = value;
    setQuizForm({ ...quizForm, options: updated });
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
            <h1 className="text-xl font-bold text-gray-800 mb-4">
              📖 Kelola Materi & Kuis
            </h1>

            {/* TAB */}
            <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-full overflow-x-auto md:w-fit">
              <button
                onClick={() => setTab("materi")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                  tab === "materi"
                    ? "bg-white shadow text-purple-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📖 Materi ({lessons.length})
              </button>
              <button
                onClick={() => setTab("quiz")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                  tab === "quiz"
                    ? "bg-white shadow text-purple-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📝 Kuis ({quizList.length})
              </button>
              <button
                onClick={() => setTab("latihan")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                  tab === "latihan"
                    ? "bg-white shadow text-purple-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Latihan ({practiceList.length})
              </button>
            </div>

            {/* MATERI TAB */}
            {tab === "materi" && (
              <>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={openAddLesson}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 text-sm"
                  >
                    ＋ Tambah Materi
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                  {loading ? (
                    <div className="p-8 text-center text-gray-400">Memuat...</div>
                  ) : lessons.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      Belum ada materi
                    </div>
                  ) : (
                    <table className="w-full min-w-[720px] text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Dialek
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Bab
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Judul
                          </th>
                          <th className="px-4 py-3 text-center text-gray-600 font-semibold w-32">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {lessons.map((l, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-xs font-medium">
                                {l.dialect}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {l.bab}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {l.title}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => openEditLesson(l)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: "lesson", item: l })}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                🗑️ Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* LATIHAN TAB */}
            {tab === "latihan" && (
              <>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={openAddPractice}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 text-sm"
                  >
                    + Tambah Latihan
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                  {practiceList.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      Belum ada latihan
                    </div>
                  ) : (
                    <table className="w-full min-w-[720px] text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Dialek
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Bab
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Jumlah Soal
                          </th>
                          <th className="px-4 py-3 text-center text-gray-600 font-semibold w-32">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {practiceList.map((practice, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-xs font-medium">
                                {practice.dialect}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {practice.bab}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {practice.totalItems}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => openEditPractice(practice)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: "practice", item: practice })}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* QUIZ TAB */}
            {tab === "quiz" && (
              <>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={openAddQuiz}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 text-sm"
                  >
                    ＋ Tambah Soal Kuis
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                  {quizList.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      Belum ada soal kuis
                    </div>
                  ) : (
                    <table className="w-full min-w-[720px] text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Pertanyaan
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Dialek
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Bab
                          </th>
                          <th className="px-4 py-3 text-center text-gray-600 font-semibold w-32">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {quizList.map((q) => (
                          <tr key={q.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-800 max-w-sm truncate">
                              {q.question}
                            </td>
                            <td className="px-4 py-3">
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-xs font-medium">
                                {q.dialect}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {q.bab}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => openEditQuiz(q)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: "quiz", item: q })}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                🗑️ Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* LESSON MODAL */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editLesson ? "✏️ Edit Materi" : "＋ Tambah Materi"}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Dialek
                    </label>
                    <select
                      value={lessonForm.dialect}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, dialect: e.target.value })
                      }
                      disabled={!!editLesson}
                      className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100"
                    >
                      <option value="ledo">Ledo</option>
                      <option value="rai">Rai</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Bab
                    </label>
                    <select
                      value={lessonForm.bab}
                      onChange={(e) =>
                        setLessonForm((prev) => ({
                          ...prev,
                          bab: e.target.value,
                          items: prev.items.map((item) => ({
                            ...item,
                            tipe:
                              e.target.value === "bab2"
                                ? "kalimat"
                                : e.target.value === "bab3"
                                ? "kosakata"
                                : "kosakata",
                            category: getLessonCategories(e.target.value)[0],
                          })),
                        }))
                      }
                      disabled={!!editLesson}
                      className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100"
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={`bab${i + 1}`}>
                          Bab {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 block">
                      Daftar Materi
                    </label>
                    <button
                      type="button"
                      onClick={addLessonItem}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100"
                    >
                      + Tambah Baris
                    </button>
                  </div>

                  <div className="space-y-3">
                    {lessonForm.items.map((item, index) => (
                      <div
                        key={index}
                        className="border rounded-xl p-3 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-gray-500">
                            Materi {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeLessonItem(index)}
                            disabled={lessonForm.items.length === 1}
                            className="text-xs font-semibold text-red-500 disabled:text-gray-300"
                          >
                            Hapus
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Indonesia
                            </label>
                            <input
                              type="text"
                              value={item.indo}
                              onChange={(e) =>
                                updateLessonItem(index, "indo", e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                              placeholder="Contoh: Rumah"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Kaili
                            </label>
                            <input
                              type="text"
                              value={item.kaili}
                              onChange={(e) =>
                                updateLessonItem(index, "kaili", e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                              placeholder="Contoh: Banua"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Tipe
                            </label>
                            <select
                              value={item.tipe}
                              onChange={(e) =>
                                updateLessonItem(index, "tipe", e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            >
                              <option value="kosakata">Kosakata</option>
                              <option value="kalimat">Kalimat</option>
                              <option value="gambar">Gambar</option>
                              <option value="materi">Materi</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Kategori
                            </label>
                            <select
                              value={item.category}
                              onChange={(e) =>
                                updateLessonItem(index, "category", e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            >
                              {getLessonCategories(lessonForm.bab).map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Gambar
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleLessonImage(index, e.target.files?.[0])
                              }
                              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                            />
                            {item.image && (
                              <div className="mt-2 flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.indo || "Preview gambar"}
                                  className="h-20 w-28 object-contain rounded-lg border bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateLessonItem(index, "image", "")
                                  }
                                  className="text-xs font-semibold text-red-500"
                                >
                                  Hapus Gambar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLessonModal(false)}
                  className="flex-1 py-2.5 border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={saveLesson}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRACTICE MODAL */}
      {showPracticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editPractice ? "Edit Latihan" : "Tambah Latihan"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Dialek
                  </label>
                  <select
                    value={practiceForm.dialect}
                    onChange={(e) =>
                      setPracticeForm({ ...practiceForm, dialect: e.target.value })
                    }
                    disabled={!!editPractice}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100"
                  >
                    <option value="ledo">Ledo</option>
                    <option value="rai">Rai</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Bab
                  </label>
                  <select
                    value={practiceForm.bab}
                    onChange={(e) =>
                      setPracticeForm((prev) => ({
                        ...prev,
                        bab: e.target.value,
                        items: prev.items.map((item) => ({
                          ...item,
                          category: getLessonCategories(e.target.value)[0],
                        })),
                      }))
                    }
                    disabled={!!editPractice}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100"
                  >
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={`bab${i + 1}`}>
                        Bab {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Daftar Soal Latihan
                </label>
                <button
                  type="button"
                  onClick={addPracticeItem}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100"
                >
                  + Tambah Soal
                </button>
              </div>

              <div className="space-y-3">
                {practiceForm.items.map((item, index) => (
                  <div key={index} className="border rounded-xl p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-500">
                        Soal {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removePracticeItem(index)}
                        disabled={practiceForm.items.length === 1}
                        className="text-xs font-semibold text-red-500 disabled:text-gray-300"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Pertanyaan
                        </label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) =>
                            updatePracticeItem(index, "question", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          placeholder="Apa arti 'Banua'?"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Kategori
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) =>
                            updatePracticeItem(index, "category", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          {getLessonCategories(practiceForm.bab).map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {item.options.map((option, optionIndex) => (
                        <div key={optionIndex}>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">
                            Opsi {optionIndex + 1}
                          </label>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              updatePracticeOption(index, optionIndex, e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                      ))}

                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Jawaban Benar
                        </label>
                        <input
                          type="text"
                          value={item.answer}
                          onChange={(e) =>
                            updatePracticeItem(index, "answer", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Gambar
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handlePracticeImage(index, e.target.files?.[0])
                          }
                          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                        />
                        {item.image && (
                          <div className="mt-2 flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.question || "Preview gambar"}
                              className="h-20 w-28 object-contain rounded-lg border bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => updatePracticeItem(index, "image", "")}
                              className="text-xs font-semibold text-red-500"
                            >
                              Hapus Gambar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPracticeModal(false)}
                  className="flex-1 py-2.5 border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={savePractice}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editQuiz ? "✏️ Edit Soal Kuis" : "＋ Tambah Soal Kuis"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Pertanyaan
                  </label>
                  <input
                    type="text"
                    value={quizForm.question}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, question: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Tulis pertanyaan..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Dialek
                    </label>
                    <select
                      value={quizForm.dialect}
                      onChange={(e) =>
                        setQuizForm({ ...quizForm, dialect: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="ledo">Ledo</option>
                      <option value="rai">Rai</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Bab
                    </label>
                    <select
                      value={quizForm.bab}
                      onChange={(e) =>
                        setQuizForm({ ...quizForm, bab: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={`bab${i + 1}`}>
                          Bab {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Opsi Jawaban
                  </label>
                  {quizForm.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="answer"
                        checked={quizForm.answer === i}
                        onChange={() =>
                          setQuizForm({ ...quizForm, answer: i })
                        }
                        className="accent-purple-600"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 mt-1">
                    ● Pilih radio untuk menandai jawaban benar
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="flex-1 py-2.5 border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={saveQuiz}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <BottomNavAdmin />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.type === "lesson"
            ? "Hapus Materi?"
            : deleteTarget?.type === "practice"
            ? "Hapus Latihan?"
            : "Hapus Soal Kuis?"
        }
        message={
          deleteTarget?.type === "lesson"
            ? `Materi ${deleteTarget?.item?.dialect}/${deleteTarget?.item?.bab} akan dihapus permanen.`
            : deleteTarget?.type === "practice"
            ? `Latihan ${deleteTarget?.item?.dialect}/${deleteTarget?.item?.bab} akan dihapus permanen.`
            : "Soal kuis ini akan dihapus permanen."
        }
        confirmLabel="Hapus"
        onConfirm={() => {
          if (deleteTarget?.type === "lesson") deleteLesson(deleteTarget.item);
          if (deleteTarget?.type === "practice") deletePractice(deleteTarget.item);
          if (deleteTarget?.type === "quiz") deleteQuiz(deleteTarget.item.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default AdminMateri;
