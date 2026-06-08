import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import ConfirmDialog from "../components/ConfirmDialog";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function DetailRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [draftRoomDetails, setDraftRoomDetails] = useState(null);
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null);
  const [questionView, setQuestionView] = useState("soal");
  const [expandedAttempt, setExpandedAttempt] = useState(null);
  
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/rooms/detail/${id}`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Gagal memuat room");
          return;
        }

        setRoom(data.room);
        setDraftRoomDetails({
          title: data.room.title,
          category: data.room.category,
          timer: data.room.timer,
        });
        setDraftQuestions(
          data.room.questions?.map((q) => ({
            ...q,
            answer:
              Array.isArray(q.answer) || q.answer === null
                ? (Array.isArray(q.answer) ? q.answer.join(" ") : "")
                : q.answer,
          })) || []
        );
      } catch (err) {
        console.log(err);
        alert("Gagal mengambil data room");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: "Bearer " + token },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data user", error);
      }
    };

    fetchUser();
  }, [id]);

  const getTypeLabel = (type) => {
    if (type === "multiple") return "Pilihan Ganda";
    if (type === "susun") return "Susun Kata";
    if (type === "gambar") return "Soal Gambar";
    if (type === "sambung") return "Sambung Kalimat";
    return type || "Soal";
  };

  const getAnswerType = (question) => {
    if (question.type === "multiple") return "pilihan";
    if (question.type === "susun") return "blok";
    return question.answerType || "pilihan";
  };

  const usesOptions = (question) => getAnswerType(question) === "pilihan";
  const usesTextAnswer = (question) => getAnswerType(question) === "ketik";
  const usesBlocks = (question) => getAnswerType(question) === "blok";

  const updateDraftField = (index, field, value) => {
    const temp = [...draftQuestions];
    temp[index][field] = value;
    setDraftQuestions(temp);
  };

  const updateDraftOption = (qIndex, oIndex, value) => {
    const temp = [...draftQuestions];
    temp[qIndex].options = temp[qIndex].options.map((opt, idx) =>
      idx === oIndex ? value : opt
    );
    setDraftQuestions(temp);
  };

  const addDraftOption = (qIndex) => {
    const temp = [...draftQuestions];
    temp[qIndex].options = [...(temp[qIndex].options || []), ""];
    setDraftQuestions(temp);
  };

  const removeDraftOption = (qIndex, oIndex) => {
    const temp = [...draftQuestions];
    temp[qIndex].options = temp[qIndex].options.filter(
      (_, idx) => idx !== oIndex
    );
    setDraftQuestions(temp);
  };

  const addDraftBlock = (qIndex) => {
    const temp = [...draftQuestions];
    temp[qIndex].blocks = [...(temp[qIndex].blocks || []), ""];
    setDraftQuestions(temp);
  };

  const updateDraftBlock = (qIndex, bIndex, value) => {
    const temp = [...draftQuestions];
    temp[qIndex].blocks = temp[qIndex].blocks.map((block, idx) =>
      idx === bIndex ? value : block
    );
    setDraftQuestions(temp);
  };

  const toggleEdit = (index) => {
    setEditingIndex(editingIndex === index ? null : index);
  };

  const saveQuestion = async (index) => {
    const question = draftQuestions[index];
    const answerType = getAnswerType(question);
    const options = usesOptions(question) ? question.options || [] : [];
    const blocks = usesBlocks(question) ? question.blocks || [] : [];

    // 1. Validasi teks pertanyaan
    if (!question.question?.trim()) {
      alert("Pertanyaan tidak boleh kosong");
      return;
    }

    // 2. Validasi pilihan ganda / opsi
    if (usesOptions(question)) {
      if (options.length < 2) {
        alert("Pilihan ganda minimal harus memiliki 2 opsi");
        return;
      }
      if (options.some(opt => !opt.trim())) {
        alert("Semua opsi jawaban harus diisi");
        return;
      }
      const uniqueOptions = new Set(options.map(opt => opt.trim().toLowerCase()));
      if (uniqueOptions.size < options.length) {
        alert("Opsi jawaban tidak boleh ada yang sama (duplikat)");
        return;
      }
      if (!question.answer) {
        alert("Silakan pilih jawaban benar");
        return;
      }
    }

    // 3. Validasi blok kata
    if (usesBlocks(question)) {
      if (blocks.length === 0) {
        alert("Silakan tambahkan minimal 1 blok kata");
        return;
      }
      if (blocks.some(block => !block.trim())) {
        alert("Semua blok kata harus diisi");
        return;
      }
      if (!question.answer?.trim()) {
        alert("Silakan masukkan susunan jawaban benar");
        return;
      }
    }

    // 4. Validasi ketik jawaban
    if (usesTextAnswer(question)) {
      if (!question.answer?.trim()) {
        alert("Silakan ketik jawaban benar");
        return;
      }
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/rooms/questions/${question.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            question: question.question,
            type: question.type,
            answer: question.answer,
            answerType,
            options,
            blocks,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menyimpan perubahan");
        return;
      }

      const updatedQuestion = data.question;
      setRoom((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === updatedQuestion.id ? updatedQuestion : q
        ),
      }));
      setDraftQuestions((prev) =>
        prev.map((q) =>
          q.id === updatedQuestion.id
            ? {
                ...updatedQuestion,
                answer:
                  Array.isArray(updatedQuestion.answer) ||
                  updatedQuestion.answer === null
                    ? Array.isArray(updatedQuestion.answer)
                      ? updatedQuestion.answer.join(" ")
                      : ""
                    : updatedQuestion.answer,
              }
            : q
        )
      );
      setEditingIndex(null);
      alert("Perubahan soal berhasil disimpan");
    } catch (err) {
      console.log(err);
      alert("Gagal menyimpan soal");
    }
  };

  const formatAnswer = (answer) => {
    if (Array.isArray(answer)) return answer.join(" ");
    return answer || "-";
  };

  const handleDeleteRoom = async () => {
    setShowDeleteConfirm(false);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (res.ok) {
        alert("Room berhasil dihapus.");
        navigate("/dashboard/guru");
      } else {
        const data = await res.json();
        alert(data.message || "Gagal menghapus room.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus room.");
    }
  };

  const handleDeleteQuestion = async () => {
    const target = deleteQuestionTarget;
    if (!target) return;
    setDeleteQuestionTarget(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/rooms/questions/${target.id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Gagal menghapus soal.");
        return;
      }

      setDraftQuestions((prev) => prev.filter((q) => q.id !== target.id));
      setRoom((prev) => ({
        ...prev,
        questions: (prev.questions || []).filter((q) => q.id !== target.id),
      }));
      if (editingIndex === target.originalIndex) {
        setEditingIndex(null);
      }
      alert(data.message || "Soal berhasil dihapus.");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus soal.");
    }
  };

  const handleDetailChange = (field, value) => {
    setDraftRoomDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveRoomDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(draftRoomDetails),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Gagal menyimpan detail room");
        return;
      }

      setRoom((prev) => ({ ...prev, ...draftRoomDetails }));
      setIsEditingRoom(false);
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan detail room");
    }
  };

  const handleCancelEdit = () => {
    setIsEditingRoom(false);
    setDraftRoomDetails({
      title: room.title,
      category: room.category,
      timer: room.timer,
    });
  };

  const filteredQuestions = draftQuestions.map((question, originalIndex) => ({
    ...question,
    originalIndex,
  }));


  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden genz-bg text-sora items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-soft-sora text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full border-4 border-sora/10 border-t-kaili animate-spin"></div>
          <p className="text-gray-700 text-lg font-semibold">Memuat detail room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex h-screen overflow-hidden genz-bg text-sora items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-soft-sora text-center text-sora/60">
          Room tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="flex genz-bg text-sora h-screen overflow-hidden">
      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
        <Navbar role="guru" user={user} showBackButton />

      <main className="p-4 md:p-6 flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="bg-sora relative overflow-hidden rounded-3xl p-7 mb-6 shadow-soft-sora border border-sora/10 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              {isEditingRoom ? (
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={draftRoomDetails.title}
                    onChange={(e) => handleDetailChange("title", e.target.value)}
                    className="w-full bg-white/10 text-white placeholder-white/50 text-3xl font-bold rounded-2xl p-3 outline-none focus:bg-white/20 transition-all"
                  />
                  <input
                    type="text"
                    value={draftRoomDetails.category}
                    onChange={(e) => handleDetailChange("category", e.target.value)}
                    className="w-full bg-white/10 text-white placeholder-white/50 rounded-2xl p-3 outline-none focus:bg-white/20 transition-all"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
                  <p className="text-white/80">{room.category}</p>
                </div>
              )}
              <div
                onClick={() => {
                  const code = room.code || room.room_code;
                  navigator.clipboard.writeText(code);
                  alert(`Kode room "${code}" berhasil disalin!`);
                }}
                className="bg-white/20 hover:bg-white/30 cursor-pointer px-5 py-3 rounded-2xl backdrop-blur-sm transition"
                title="Klik untuk salin kode"
              >
                <p className="text-xs text-white/80 font-semibold mb-1">
                  Kode Room
                </p>
                <p className="text-2xl font-bold tracking-widest text-center">
                  {room.code || room.room_code}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6 text-sm items-center">
              {isEditingRoom ? (
                <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                  ⏱️
                  <input
                    type="number"
                    value={draftRoomDetails.timer}
                    onChange={(e) => handleDetailChange("timer", e.target.value)}
                    className="bg-transparent w-16 text-white"
                  />
                  detik
                </div>
              ) : (
                <div className="bg-white/10 px-4 py-2 rounded-xl">⏱️ {room.timer} detik</div>
              )}
              <div className="bg-white/10 px-4 py-2 rounded-xl">📚 {room.questions?.length || 0} soal</div>
              <div className="ml-auto">
                {isEditingRoom ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveRoomDetails}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl"
                    >
                      Simpan Detail
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingRoom(true)} className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-xl">Edit Detail</button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-soft-sora mb-5">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-xl font-bold text-gray-800">Daftar Soal</h2>
              <p className="text-sm text-gray-500">
                Pilih tampilan daftar soal atau jawaban dan nilai siswa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
              {[
                { key: "soal", label: "Soal" },
                { key: "jawaban", label: "Jawaban & Nilai" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setQuestionView(item.key)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    questionView === item.key
                      ? "bg-kaili text-white shadow"
                      : "text-gray-500 hover:bg-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {questionView === "soal" ? (
          <div className="space-y-5">
            {filteredQuestions.map((q) => {
              const index = q.originalIndex;
              const isEditing = editingIndex === index;
              const currentQuestion = q;
              const answerType = getAnswerType(currentQuestion);
              const canChangeAnswerType = q.type === "gambar" || q.type === "sambung";
              return (
                <div key={q.id} className="bg-white rounded-3xl shadow-soft-sora overflow-hidden border border-sora/5">
                  <div className="flex flex-col gap-3 px-5 py-4 border-b bg-gray-50 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="font-bold text-gray-800 text-lg">Soal {index + 1}</h2>
                      <p className="text-sm text-gray-400 mt-1">{getTypeLabel(q.type)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleEdit(index)}
                        className="bg-kaili text-white px-4 py-2 rounded-2xl"
                      >
                        {isEditing ? "Batal" : "Edit Soal"}
                      </button>
                      {isEditing && (
                        <button
                          onClick={() => saveQuestion(index)}
                          className="bg-green-600 text-white px-4 py-2 rounded-2xl"
                        >
                          Simpan
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteQuestionTarget(q)}
                        className="bg-red-500 text-white px-4 py-2 rounded-2xl"
                      >
                        Hapus Soal
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Pertanyaan</label>
                          <input
                            type="text"
                            value={currentQuestion.question}
                            onChange={(e) => updateDraftField(index, "question", e.target.value)}
                            className="w-full border-2 border-sora/10 bg-cream/50 p-3 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
                          />
                        </div>

                        {canChangeAnswerType && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2">Tipe Jawaban</label>
                              <select
                                value={answerType}
                                onChange={(e) => updateDraftField(index, "answerType", e.target.value)}
                                className="w-full border-2 border-sora/10 bg-cream/50 p-3 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
                              >
                                <option value="pilihan">Pilihan Ganda</option>
                                <option value="ketik">Ketik Jawaban</option>
                                <option value="blok">Blok Kata</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {usesOptions(currentQuestion) && (
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold">Opsi Jawaban</label>
                            {currentQuestion.options?.map((option, oIndex) => (
                              <div key={oIndex} className="flex gap-2">
                                <input
                                  value={option}
                                  onChange={(e) => updateDraftOption(index, oIndex, e.target.value)}
                                  className="teacher-input flex-1 border p-3 rounded-xl"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeDraftOption(index, oIndex)}
                                  className="bg-red-500 text-white px-4 py-3 rounded-xl"
                                >
                                  Hapus
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addDraftOption(index)}
                              className="bg-gray-200 px-4 py-3 rounded-xl"
                            >
                              + Tambah Opsi
                            </button>
                          </div>
                        )}

                        {usesTextAnswer(currentQuestion) && (
                          <div>
                            <label className="block text-sm font-semibold mb-2">Jawaban Benar</label>
                            <input
                              type="text"
                              value={currentQuestion.answer || ""}
                              onChange={(e) => updateDraftField(index, "answer", e.target.value)}
                              className="w-full border-2 border-sora/10 bg-cream/50 p-3 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
                            />
                          </div>
                        )}

                        {usesBlocks(currentQuestion) && (
                          <div className="space-y-4">
                            <label className="block text-sm font-semibold">Blok Kata</label>
                            {currentQuestion.blocks?.map((block, bIndex) => (
                              <input
                                key={bIndex}
                                type="text"
                                value={block}
                                onChange={(e) => updateDraftBlock(index, bIndex, e.target.value)}
                                className="w-full border-2 border-sora/10 bg-cream/50 p-3 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => addDraftBlock(index)}
                              className="bg-gray-200 px-4 py-3 rounded-xl"
                            >
                              + Tambah Blok
                            </button>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Susunan Jawaban</label>
                              <input
                                type="text"
                                value={currentQuestion.answer || ""}
                                onChange={(e) => updateDraftField(index, "answer", e.target.value)}
                                className="w-full border p-3 rounded-xl"
                              />
                            </div>
                          </div>
                        )}

                        {usesOptions(currentQuestion) && (
                          <div>
                            <label className="block text-sm font-semibold mb-2">Jawaban Benar</label>
                            <select
                              value={currentQuestion.answer || ""}
                              onChange={(e) => updateDraftField(index, "answer", e.target.value)}
                              className="w-full border-2 border-sora/10 bg-cream/50 p-3 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
                            >
                              <option value="">Pilih Jawaban Benar</option>
                              {currentQuestion.options?.map((opt, i) => (
                                <option key={i} value={opt}>
                                  {opt || `Opsi ${i + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="bg-cream/50 border border-sora/10 rounded-2xl p-4 mb-5">
                          <p className="text-sm text-white/800 font-semibold mb-2">Pertanyaan</p>
                          <p className="text-gray-800 text-lg font-medium leading-relaxed">{q.question}</p>
                          <p className="text-xs text-kaili/80 mt-2">
                            Jawaban: {answerType === "pilihan" ? "Pilihan Ganda" : answerType === "ketik" ? "Ketik Jawaban" : "Blok Kata"}
                          </p>
                        </div>

                        {usesOptions(q) && q.options?.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-gray-500">Opsi Jawaban</p>
                            {q.options.map((opt, oIndex) => (
                              <div
                                key={oIndex}
                                className="rounded-2xl border bg-gray-50 border-gray-200 px-4 py-3"
                              >
                                {opt || `Opsi ${oIndex + 1}`}
                              </div>
                            ))}
                          </div>
                        )}

                        {usesBlocks(q) && q.blocks?.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-gray-500">Blok Kata</p>
                            <div className="flex flex-wrap gap-2">
                              {q.blocks.map((block, bIndex) => (
                                <span
                                  key={bIndex}
                                  className="bg-cream text-sora px-4 py-2 rounded-xl"
                                >
                                  {block || `Blok ${bIndex + 1}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredQuestions.length === 0 && (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
                Tidak ada soal yang cocok dengan filter.
              </div>
            )}
          </div>
          ) : null}

          {questionView === "jawaban" && (
          <div className="bg-white p-6 rounded-3xl shadow-soft-sora mt-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold">Nilai Siswa</h2>
                <p className="text-gray-500">Klik nama siswa untuk melihat detail jawaban</p>
              </div>
            </div>

            {room.attempts?.length > 0 ? (
              <div className="space-y-3">
                {room.attempts.map((attempt, idx) => {
                  const correctCount = attempt.answers.filter((a) => a.is_correct).length;
                  const wrongCount = attempt.answers.length - correctCount;
                  const isExpanded = expandedAttempt === attempt.id;
                  const percentage = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;

                  return (
                    <div key={attempt.id} className="bg-white border border-sora/10 rounded-3xl overflow-hidden transition-all shadow-soft-sora">
                      {/* Summary Row - Clickable */}
                      <button
                        type="button"
                        onClick={() => setExpandedAttempt(isExpanded ? null : attempt.id)}
                        className="w-full text-left px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* LEFT GROUP: Rank & Student Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank Number */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cream text-sora flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>

                          {/* Student Name & Date */}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 truncate text-sm sm:text-base">{attempt.student_name}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400">{new Date(attempt.created_at).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* RIGHT GROUP: Stats, Score & Chevron */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t pt-2.5 sm:border-0 sm:pt-0 sm:gap-4">
                          {/* Correct / Wrong Badges */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                              ✓ {correctCount}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                              ✗ {wrongCount}
                            </span>
                          </div>

                          {/* Score */}
                          <div className="flex-shrink-0 text-right min-w-[60px] sm:min-w-[70px]">
                            <p className={`font-bold text-base sm:text-lg ${percentage >= 70 ? "text-green-600" : percentage >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                              {attempt.score}/{attempt.total}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-400">{percentage}%</p>
                          </div>

                          {/* Chevron */}
                          <svg
                            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Expandable Detail */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-3">
                          <p className="text-sm font-semibold text-gray-600 mb-2">Detail Jawaban</p>
                          {attempt.answers.map((answer, aIdx) => {
                            const question = room.questions?.find((item) => item.id === answer.question_id);
                            return (
                              <div
                                key={`${attempt.id}-${aIdx}`}
                                className="relative rounded-2xl border border-gray-200 p-4 bg-white"
                              >
                                <div className="text-center px-12">
                                  <p className="font-semibold text-gray-700 break-words">
                                    {question ? question.question : `Soal ${aIdx + 1}`}
                                  </p>
                                </div>
                                <span
                                  className={`absolute top-1/2 -translate-y-1/2 right-4 text-sm font-semibold px-3 py-1 rounded-full ${
                                    answer.is_correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {answer.is_correct ? "Benar" : "Salah"}
                                </span>
                                <div className="mt-3 text-center px-12">
                                  <p className="text-sm text-gray-500 mb-1">Jawaban Siswa</p>
                                  <p className="font-medium text-gray-800 break-words">{formatAnswer(answer.answer)}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500">Belum ada siswa yang mengerjakan room ini.</div>
            )}
          </div>
          )}
        </div>
      </main>
      </div>
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Hapus Room?"
        message={`Room "${room?.title || "ini"}" akan dihapus permanen dan tidak bisa dikembalikan.`}
        confirmLabel="Hapus Room"
        onConfirm={handleDeleteRoom}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <ConfirmDialog
        open={Boolean(deleteQuestionTarget)}
        title="Hapus Soal?"
        message={`Soal ${deleteQuestionTarget?.originalIndex + 1 || ""} akan dihapus permanen beserta jawaban siswa yang terkait.`}
        confirmLabel="Hapus Soal"
        onConfirm={handleDeleteQuestion}
        onCancel={() => setDeleteQuestionTarget(null)}
      />
    </div>
  );
}

export default DetailRoom;
