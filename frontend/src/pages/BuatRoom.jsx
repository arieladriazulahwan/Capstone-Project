import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBookOpen, FiClock, FiType } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024;

const questionTypes = [
  { type: "multiple", label: "Pilihan Ganda", className: "bg-blue-500 hover:bg-blue-600" },
  { type: "susun", label: "Susun Kata", className: "bg-green-500 hover:bg-green-600" },
  { type: "gambar", label: "Soal Gambar", className: "bg-yellow-500 hover:bg-yellow-600" },
  { type: "sambung", label: "Sambung Kalimat", className: "bg-purple-500 hover:bg-purple-600" },
];

function BuatRoom() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [timer, setTimer] = useState(15);
  const [user, setUser] = useState(null);

  const [questions, setQuestions] = useState([]);
  const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700";
  const hintClass = "mt-1 text-xs text-gray-400";

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login/guru");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await res.json();
        setUser(data.user || data);
      } catch (err) {
        console.log(err);
        navigate("/login/guru");
      }
    };

    fetchUser();
  }, [navigate]);

  // Loading state
  if (!user) {
    return (
      <div className="flex h-screen overflow-hidden genz-bg text-sora items-center justify-center">
        <div className="teacher-loading-card rounded-3xl bg-white/90 px-6 py-5 text-center shadow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="font-semibold text-gray-700">Memuat halaman buat room...</p>
        </div>
      </div>
    );
  }

  // =========================
  // TAMBAH SOAL
  // =========================
  const addQuestion = (type) => {
    setQuestions([
      ...questions,
      {
        type,

        question: "",

        answerType:
          type === "multiple"
            ? "pilihan"
            : type === "sambung"
            ? "blok"
            : type === "susun"
            ? "blok"
            : "pilihan",

        options: ["", ""],

        answer: "",

        answerBlocks: [],

        blocks: [],

        image: "",
      },
    ]);
  };

  // =========================
  // UPDATE FIELD
  // =========================
  const updateQuestion = (index, field, value) => {
    const temp = [...questions];

    temp[index][field] = value;

    setQuestions(temp);
  };

  // =========================
  // OPTION
  // =========================
  const updateOption = (
    qIndex,
    oIndex,
    value
  ) => {
    const temp = [...questions];

    temp[qIndex].options[oIndex] = value;

    setQuestions(temp);
  };

  const addOption = (index) => {
    const temp = [...questions];

    if (temp[index].options.length < 5) {
      temp[index].options.push("");
    }

    setQuestions(temp);
  };

  const removeOption = (
    qIndex,
    oIndex
  ) => {
    const temp = [...questions];

    if (temp[qIndex].options.length > 2) {
      temp[qIndex].options.splice(
        oIndex,
        1
      );
    }

    setQuestions(temp);
  };

  const removeQuestion = (index) => {
    const temp = [...questions];
    temp.splice(index, 1);
    setQuestions(temp);
  };

  const clearAnswer = (index) => {
    const temp = [...questions];
    temp[index].answer = "";
    temp[index].answerBlocks = [];
    setQuestions(temp);
  };

  // =========================
  // BLOK KATA
  // =========================
  const addBlock = (index) => {
    const temp = [...questions];

    temp[index].blocks.push("");

    setQuestions(temp);
  };

  const updateBlock = (
    qIndex,
    bIndex,
    value
  ) => {
    const temp = [...questions];

    temp[qIndex].blocks[bIndex] = value;

    setQuestions(temp);
  };

  const removeBlock = (
    qIndex,
    bIndex
  ) => {
    const temp = [...questions];
    const removedBlock = temp[qIndex].blocks[bIndex];

    temp[qIndex].blocks.splice(bIndex, 1);
    temp[qIndex].answerBlocks = temp[qIndex].answerBlocks.filter(
      (block) => block !== removedBlock
    );

    setQuestions(temp);
  };

  // =========================
  // PILIH BLOK JAWABAN
  // =========================
  const selectAnswerBlock = (
    qIndex,
    block
  ) => {
    const temp = [...questions];

    temp[qIndex].answerBlocks.push(block);

    setQuestions(temp);
  };

  const removeAnswerBlock = (
    qIndex,
    indexAnswer
  ) => {
    const temp = [...questions];

    temp[qIndex].answerBlocks.splice(
      indexAnswer,
      1
    );

    setQuestions(temp);
  };

  // =========================
  // IMAGE
  // =========================
  const handleImage = (
    e,
    index
  ) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      alert("Gambar maksimal 50MB");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const temp = [...questions];

      temp[index].image = reader.result;

      setQuestions(temp);
    };

    reader.readAsDataURL(file);
  };

  // =========================
  // SUBMIT
  // =========================
  const submitRoom = async () => {
    // 1. Validasi Detail Room
    if (!title.trim()) {
      alert("Nama Room tidak boleh kosong");
      return;
    }
    if (!category.trim()) {
      alert("Subjek tidak boleh kosong");
      return;
    }
    if (Number(timer) <= 0) {
      alert("Timer per soal harus lebih besar dari 0 detik");
      return;
    }
    if (questions.length === 0) {
      alert("Silakan tambah minimal 1 soal terlebih dahulu");
      return;
    }

    // 2. Validasi Setiap Soal
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const indexDisplay = i + 1;

      if (!q.question.trim()) {
        alert(`Pertanyaan pada Soal #${indexDisplay} tidak boleh kosong`);
        return;
      }

      if (q.type === "gambar" && !q.image) {
        alert(`Silakan pilih atau unggah gambar untuk Soal #${indexDisplay}`);
        return;
      }

      const answerType = q.answerType;

      if (answerType === "pilihan" || q.type === "multiple") {
        if (q.options.some(opt => !opt.trim())) {
          alert(`Semua opsi jawaban pada Soal #${indexDisplay} harus diisi`);
          return;
        }
        const uniqueOptions = new Set(q.options.map(opt => opt.trim().toLowerCase()));
        if (uniqueOptions.size < q.options.length) {
          alert(`Opsi jawaban pada Soal #${indexDisplay} tidak boleh ada yang sama (duplikat)`);
          return;
        }
        if (!q.answer) {
          alert(`Silakan pilih jawaban benar untuk Soal #${indexDisplay}`);
          return;
        }
      } else if (answerType === "ketik") {
        if (!q.answer.trim()) {
          alert(`Silakan ketik jawaban benar untuk Soal #${indexDisplay}`);
          return;
        }
      } else if (answerType === "blok" || q.type === "susun") {
        if (q.blocks.length === 0) {
          alert(`Silakan tambahkan minimal 1 blok kata untuk Soal #${indexDisplay}`);
          return;
        }
        if (q.blocks.some(block => !block.trim())) {
          alert(`Semua blok kata pada Soal #${indexDisplay} harus diisi`);
          return;
        }
        if (q.answerBlocks.length === 0) {
          alert(`Silakan susun jawaban benar untuk Soal #${indexDisplay}`);
          return;
        }
      }
    }

    try {
      const payload = {
        title,
        category,
        timer,

        questions: questions.map((q) => ({
          ...q,
          answerType: q.answerType, // Include answerType

          answer:
            q.answerType === "blok" ||
            q.type === "susun"
              ? q.answerBlocks.join(" ")
              : q.answer,
        })),
      };

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/api/rooms/create`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Authorization: "Bearer " + token,
          },

          body: JSON.stringify(payload),
        }
      );

      let data;

      try {
        data = await res.json();
      } catch {
        alert(
          "Response server bukan JSON"
        );
        return;
      }

      if (!res.ok) {
        alert(data.message);
        return;
      }

    alert("Room berhasil dibuat!\nKode: " + data.code);

    navigate("/dashboard/guru");
    } catch (err) {
      console.log(err);

      alert("Gagal membuat room");
    }
  };

  return (
    <div className="flex teacher-page-bg h-screen overflow-hidden">
      <Sidebar role="guru" />
      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
        <Navbar role="guru" user={user} showBackButton={true} />

      <div className="max-w-5xl mx-auto p-4 pb-64">

        {/* HEADER */}
        <div className="teacher-hero-card mb-5 rounded-3xl p-5 text-white shadow-xl">
          <p className="mb-2 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            Buat aktivitas guru
          </p>
          <h1 className="text-2xl font-black">Buat Room</h1>
          <p className="mt-1 text-sm text-blue-50">
            Buat Room Untuk Siswa.
          </p>
        </div>
        <h1 className="sr-only">
          🎯 Buat Room
        </h1>

      {/* ROOM */}
      <div className="teacher-form-card bg-white/90 p-5 rounded-3xl shadow mb-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
              Room
            </p>
            <h2 className="text-lg font-black text-gray-900">Masukkan Detail Room</h2>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 sm:flex">
            <FiBookOpen size={24} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="teacher-field">
            <label className={labelClass}>Nama Room</label>
            <div className="teacher-input-shell">
              <FiType className="teacher-input-icon" size={19} />
              <input
                type="text"
                placeholder="Contoh: Kuis Bab 1"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="teacher-input teacher-input-with-icon w-full border p-3 rounded-xl"
              />
            </div>
          </div>

          <div className="teacher-field">
            <label className={labelClass}>Subjek</label>
            <div className="teacher-input-shell">
              <FiBookOpen className="teacher-input-icon" size={19} />
              <input
                type="text"
                placeholder="Contoh: Bahasa Kaili Ledo"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="teacher-input teacher-input-with-icon w-full border p-3 rounded-xl"
              />
            </div>
          </div>

          <div className="teacher-field md:col-span-2">
            <label className={labelClass}>Timer per Soal</label>
            <div className="teacher-input-shell">
              <FiClock className="teacher-input-icon" size={19} />
              <input
                type="number"
                placeholder="Contoh: 15"
                value={timer}
                onChange={(e) =>
                  setTimer(parseInt(e.target.value) || 0)
                }
                className="teacher-input teacher-input-with-icon w-full border p-3 rounded-xl"
              />
            </div>
            <p className={`${hintClass} text-left`}>Waktu dihitung dalam detik.</p>
          </div>
        </div>

      </div>

      {/* LIST */}
      <div className="space-y-5">

        {questions.map((q, index) => (
          <div
            key={index}
            className="teacher-question-card bg-white/90 p-5 rounded-3xl shadow"
          >

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">
                Soal #{index + 1}
              </h2>

              <button
                onClick={() => removeQuestion(index)}
                className="text-red-500 font-semibold transition hover:text-red-700"
              >
                Hapus Soal
              </button>
            </div>

            {/* PERTANYAAN */}
            <div className="mb-4">
              <label className={labelClass}>Pertanyaan</label>
              <input
                type="text"
                placeholder="Masukkan pertanyaan"
                value={q.question}
                onChange={(e) =>
                  updateQuestion(
                    index,
                    "question",
                    e.target.value
                  )
                }
                className="teacher-input w-full border p-3 rounded-xl"
              />
            </div>

            {/* GAMBAR */}
            {q.type === "gambar" && (
              <div className="mb-4">
                <label className={labelClass}>Gambar Soal</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImage(
                      e,
                      index
                    )
                  }
                  className="mb-3"
                />
                <p className={hintClass}>Format gambar, maksimal 50MB.</p>

                {q.image && (
                  <img
                    src={q.image}
                    alt="preview"
                    className="w-48 rounded-xl border"
                  />
                )}

              </div>
            )}

            {/* ANSWER TYPE */}
            {(q.type === "gambar" ||
              q.type === "sambung") && (
              <div className="mb-4">

                <p className="font-semibold mb-2">
                  Jenis Jawaban
                </p>

                <select
                  value={
                    q.type === "sambung" && q.answerType === "pilihan"
                      ? "blok"
                      : q.answerType
                  }
                  onChange={(e) =>
                    updateQuestion(
                      index,
                      "answerType",
                      e.target.value
                    )
                  }
                  className="teacher-input w-full border p-3 rounded-xl"
                >
                  {q.type === "gambar" && (
                    <option value="pilihan">
                      Pilihan Ganda
                    </option>
                  )}

                  <option value="ketik">
                    Ketik Jawaban
                  </option>

                  <option value="blok">
                    Blok Kata
                  </option>

                </select>

              </div>
            )}

            {/* MULTIPLE */}
            {(q.type === "multiple" ||
              ((q.type === "gambar" ||
                q.type === "sambung") &&
                q.answerType ===
                  "pilihan")) && (
              <>

                <p className="font-semibold mb-2">
                  Opsi Jawaban
                </p>

                {q.options.map(
                  (opt, oIndex) => (
                    <div
                      key={oIndex}
                      className="flex gap-2 mb-2"
                    >

                      <input
                        type="text"
                        placeholder={`Opsi ${
                          oIndex + 1
                        }`}
                        value={opt}
                        onChange={(e) =>
                          updateOption(
                            index,
                            oIndex,
                            e.target.value
                          )
                        }
                        className="teacher-input flex-1 border p-2 rounded-xl"
                        aria-label={`Opsi jawaban ${oIndex + 1}`}
                      />

                      <button
                        onClick={() =>
                          removeOption(
                            index,
                            oIndex
                          )
                        }
                        className="bg-red-500 text-white px-3 rounded-xl"
                      >
                        X
                      </button>

                    </div>
                  )
                )}

                {q.options.length < 5 && (
                  <button
                    onClick={() =>
                      addOption(index)
                    }
                    className="bg-gray-200 px-3 py-2 rounded-xl mb-3"
                  >
                    + Tambah Opsi
                  </button>
                )}

                <div className="mt-3">
                  <label className={labelClass}>Jawaban Benar</label>
                  <select
                    value={q.answer}
                    onChange={(e) =>
                      updateQuestion(
                        index,
                        "answer",
                        e.target.value
                      )
                    }
                    className="teacher-input w-full border p-3 rounded-xl"
                  >
                    <option value="">
                      Pilih Jawaban Benar
                    </option>

                    {q.options.map(
                      (opt, i) => (
                        <option
                          key={i}
                          value={opt}
                        >
                          {opt ||
                            `Opsi ${
                              i + 1
                            }`}
                        </option>
                      )
                    )}

                  </select>
                </div>

              </>
            )}

            {/* TEXT */}
            {(q.type === "gambar" ||
              q.type === "sambung") &&
              q.answerType ===
                "ketik" && (
                <div>
                  <label className={labelClass}>Jawaban Benar</label>
                  <input
                    type="text"
                    placeholder="Masukkan jawaban benar"
                    value={q.answer}
                    onChange={(e) =>
                      updateQuestion(
                        index,
                        "answer",
                        e.target.value
                      )
                    }
                    className="teacher-input w-full border p-3 rounded-xl"
                  />
                </div>
              )}

            {/* SUSUN / BLOCK */}
            {(q.type === "susun" ||
              ((q.type === "gambar" ||
                q.type === "sambung") &&
                q.answerType ===
                  "blok")) && (
              <>

                <p className="font-semibold mb-2">
                  Blok Kata
                </p>

                {q.blocks.map(
                  (block, bIndex) => (
                    <div
                      key={bIndex}
                      className="flex gap-2 mb-2"
                    >
                      <input
                        type="text"
                        placeholder={`Blok ${
                          bIndex + 1
                        }`}
                        value={block}
                        onChange={(e) =>
                          updateBlock(
                            index,
                            bIndex,
                            e.target.value
                          )
                        }
                        className="teacher-input flex-1 border p-2 rounded-xl"
                        aria-label={`Blok kata ${bIndex + 1}`}
                      />

                      <button
                        onClick={() =>
                          removeBlock(
                            index,
                            bIndex
                          )
                        }
                        className="bg-red-500 text-white px-3 rounded-xl"
                      >
                        X
                      </button>
                    </div>
                  )
                )}

                <button
                  onClick={() =>
                    addBlock(index)
                  }
                  className="bg-gray-200 px-3 py-2 rounded-xl mb-4"
                >
                  + Tambah Blok
                </button>

                <p className="font-semibold mb-2">
                  Pilih Jawaban
                </p>

                <div className="flex flex-wrap gap-2 mb-4">

                  {q.blocks.map(
                    (block, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          selectAnswerBlock(
                            index,
                            block
                          )
                        }
                        className="px-4 py-2 rounded-xl border bg-white"
                      >
                        {block ||
                          "Kosong"}
                      </button>
                    )
                  )}

                </div>

                <div className="flex flex-wrap gap-2">

                  {q.answerBlocks.map(
                    (block, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          removeAnswerBlock(
                            index,
                            i
                          )
                        }
                        className="bg-green-500 text-white px-4 py-2 rounded-xl"
                      >
                        {block} ✕
                      </button>
                    )
                  )}

                </div>

              </>
            )}

            {(q.answer || q.answerBlocks.length > 0) && (
              <button
                onClick={() => clearAnswer(index)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl"
              >
                Hapus Jawaban
              </button>
            )}

          </div>
        ))}

      </div>

      <div className="teacher-floating-actions fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-5xl rounded-3xl border border-blue-100 bg-white/95 p-3 shadow-2xl backdrop-blur">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-gray-700">Tambah Soal</p>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
            {questions.length} soal
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {questionTypes.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => addQuestion(item.type)}
              className={`${item.className} rounded-xl px-3 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5`}
            >
              + {item.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/guru")}
            className="rounded-xl border border-gray-200 bg-white p-3 text-sm font-bold text-gray-600 shadow-sm hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={submitRoom}
            className="teacher-room-action rounded-xl bg-blue-600 p-3 text-sm font-bold text-white shadow hover:bg-blue-700"
          >
            Buat Room
          </button>
        </div>
      </div>

      {/* SUBMIT */}
      <button
        onClick={submitRoom}
        className="hidden"
      >
        🚀 Buat Room
      </button>

      </div>
      </div>
      <BottomNav role="guru" />
    </div>
  );
}

export default BuatRoom;
