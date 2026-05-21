import { useEffect, useState } from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import SidebarAdmin from "../components/SidebarAdmin";

const API = "/api/admin";

function AdminMateri() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("materi"); // materi | quiz
  const [lessons, setLessons] = useState([]);
  const [quizList, setQuizList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal materi
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    dialect: "ledo",
    bab: "bab1",
    title: "",
    content: "",
  });
  const [editLesson, setEditLesson] = useState(null);

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

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetchUser();
    fetchLessons();
    fetchQuiz();
  }, []);

  const fetchUser = async () => {
    const res = await fetch("/api/auth/profile", {
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

  // ========= MATERI HANDLERS =========
  const openAddLesson = () => {
    setEditLesson(null);
    setLessonForm({ dialect: "ledo", bab: "bab1", title: "", content: "" });
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
        content: JSON.stringify(data, null, 2),
      });
      setShowLessonModal(true);
    }
  };

  const saveLesson = async () => {
    try {
      const body = JSON.parse(lessonForm.content);
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
    } catch {
      alert("Format JSON tidak valid!");
    }
  };

  const deleteLesson = async (lesson) => {
    if (!confirm(`Hapus materi ${lesson.dialect}/${lesson.bab}?`)) return;
    const res = await fetch(`${API}/lessons/${lesson.dialect}/${lesson.bab}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) fetchLessons();
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
    if (!confirm("Hapus soal kuis ini?")) return;
    const res = await fetch(`${API}/quiz/${id}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) fetchQuiz();
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
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* HEADER */}
            <h1 className="text-xl font-bold text-gray-800 mb-4">
              📖 Kelola Materi & Kuis
            </h1>

            {/* TAB */}
            <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
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

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {loading ? (
                    <div className="p-8 text-center text-gray-400">Memuat...</div>
                  ) : lessons.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      Belum ada materi
                    </div>
                  ) : (
                    <table className="w-full text-sm">
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
                                onClick={() => deleteLesson(l)}
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

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {quizList.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      Belum ada soal kuis
                    </div>
                  ) : (
                    <table className="w-full text-sm">
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
                                onClick={() => deleteQuiz(q.id)}
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
                <div className="grid grid-cols-2 gap-3">
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
                        setLessonForm({ ...lessonForm, bab: e.target.value })
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
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Konten (JSON)
                  </label>
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, content: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 h-64 resize-y"
                    placeholder='{"title": "Bab 1", "content": [...]}'
                  />
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

                <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
}

export default AdminMateri;
