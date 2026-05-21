import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import NavbarGuru from "../components/NavbarGuru";

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
    if (!window.confirm("Apakah Anda yakin ingin menghapus room ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-lg font-semibold">Room tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavbarGuru user={user} showBackButton />

      <main className="p-4 md:p-6 flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-3xl p-6 text-white shadow-lg mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              {isEditingRoom ? (
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={draftRoomDetails.title}
                    onChange={(e) => handleDetailChange("title", e.target.value)}
                    className="w-full bg-white/20 text-white placeholder-blue-200 text-3xl font-bold rounded-xl p-2"
                  />
                  <input
                    type="text"
                    value={draftRoomDetails.category}
                    onChange={(e) => handleDetailChange("category", e.target.value)}
                    className="w-full bg-white/20 text-white placeholder-blue-200 rounded-xl p-2"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
                  <p className="text-blue-100">{room.category}</p>
                </div>
              )}
              <div className="bg-white/20 px-5 py-3 rounded-2xl backdrop-blur-sm">
                <p className="text-xs text-blue-100 font-semibold mb-1">
                  Kode Room
                </p>
                <p className="text-2xl font-bold tracking-widest">
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
                  <button onClick={handleSaveRoomDetails} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl">Simpan Detail</button>
                ) : (
                  <button onClick={() => setIsEditingRoom(true)} className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-xl">Edit Detail</button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {draftQuestions.map((q, index) => {
              const isEditing = editingIndex === index;
              const currentQuestion = q;
              const answerType = getAnswerType(currentQuestion);
              const canChangeAnswerType = q.type === "gambar" || q.type === "sambung";
              return (
                <div key={q.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex flex-col gap-3 px-5 py-4 border-b bg-gray-50 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="font-bold text-gray-800 text-lg">Soal {index + 1}</h2>
                      <p className="text-sm text-gray-400 mt-1">{getTypeLabel(q.type)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleEdit(index)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-2xl"
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
                            className="w-full border p-3 rounded-xl"
                          />
                        </div>

                        {canChangeAnswerType && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2">Tipe Jawaban</label>
                              <select
                                value={answerType}
                                onChange={(e) => updateDraftField(index, "answerType", e.target.value)}
                                className="w-full border p-3 rounded-xl"
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
                                  className="flex-1 border p-3 rounded-xl"
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
                              className="w-full border p-3 rounded-xl"
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
                                className="w-full border p-3 rounded-xl"
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
                            <input
                              type="text"
                              value={currentQuestion.answer || ""}
                              onChange={(e) => updateDraftField(index, "answer", e.target.value)}
                              className="w-full border p-3 rounded-xl"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
                          <p className="text-sm text-blue-500 font-semibold mb-2">Pertanyaan</p>
                          <p className="text-gray-800 text-lg font-medium leading-relaxed">{q.question}</p>
                          <p className="text-xs text-blue-400 mt-2">
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
                                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl"
                                >
                                  {block || `Blok ${bIndex + 1}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
                          <p className="text-sm text-gray-500 mb-1">Jawaban Benar</p>
                          <p className="font-bold text-yellow-700 text-lg">{formatAnswer(q.answer)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl shadow p-6 mt-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold">Nilai Siswa</h2>
                <p className="text-gray-500">Daftar murid yang sudah mengerjakan room</p>
              </div>
            </div>

            {room.attempts?.length > 0 ? (
              <div className="space-y-4">
                {room.attempts.map((attempt) => (
                  <div key={attempt.id} className="border border-gray-200 rounded-3xl p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Nama Siswa</p>
                        <p className="font-semibold text-gray-800">{attempt.student_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Nilai</p>
                        <p className="font-bold text-green-700">{attempt.score}/{attempt.total}</p>
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        {new Date(attempt.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {attempt.answers.map((answer, idx) => {
                        const question = room.questions?.find((item) => item.id === answer.question_id);
                        return (
                          <div
                            key={`${attempt.id}-${idx}`}
                            className="rounded-2xl border border-gray-200 p-4 bg-gray-50"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-semibold text-gray-700">
                                {question ? question.question : `Soal ${idx + 1}`}
                              </p>
                              <span
                                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                  answer.is_correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                              >
                                {answer.is_correct ? "Benar" : "Salah"}
                              </span>
                            </div>
                            <div className="mt-3">
                              <p className="text-sm text-gray-500 mb-1">Jawaban Siswa</p>
                              <p className="font-medium text-gray-800">{formatAnswer(answer.answer)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Belum ada siswa yang mengerjakan room ini.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DetailRoom;
