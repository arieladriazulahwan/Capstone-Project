import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBookOpen, FiClock, FiType, FiCheckCircle, FiX, FiTarget, FiPlus, FiChevronRight } from "react-icons/fi";
import Navbar from "../components/Navbar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024;

const questionTypes = [
  { type: "multiple", label: "Pilihan Ganda" },
  { type: "susun", label: "Susun Kata" },
  { type: "gambar", label: "Soal Gambar" },
  { type: "sambung", label: "Sambung Kalimat" },
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
        <div className="bg-white p-8 rounded-3xl shadow-soft-sora text-center">
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
    <div className="flex genz-bg text-sora h-screen overflow-hidden">
      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
        <Navbar role="guru" user={user} showBackButton={true} />

      <div className="max-w-7xl mx-auto p-4 pb-48 lg:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* KOLOM KIRI (KONTEN UTAMA) */}
        <div className="lg:col-span-8 lg:col-start-1 flex flex-col gap-5">
        <div className="bg-sora relative overflow-hidden rounded-3xl p-7 mb-6 shadow-soft-sora border border-sora/10 text-white">
          <p className="mb-2 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            Buat aktivitas guru
          </p>
          <h1 className="text-2xl font-black">Buat Room</h1>
          <p className="mt-1 text-sm text-white/80">
            Buat Room Untuk Siswa.
          </p>
        </div>
          Buat Room

      {/* ROOM DETAIL */}
      <div className="bg-white p-5 rounded-3xl shadow-soft-sora">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/800">
              Room
            </p>
            <h2 className="text-lg font-black text-gray-900">Masukkan Detail Room</h2>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-cream text-kaili sm:flex">
            <FiBookOpen size={24} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="teacher-field">
            <label className={labelClass}>Nama Room</label>
            <div className="relative">
              <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-sora/40" size={19} />
              <input
                type="text"
                placeholder="Contoh: Kuis Bab 1"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full border-2 border-sora/10 bg-cream/50 p-3 pl-11 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="teacher-field">
            <label className={labelClass}>Subjek</label>
            <div className="relative">
              <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-sora/40" size={19} />
              <input
                type="text"
                placeholder="Contoh: Bahasa Kaili Ledo"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full border-2 border-sora/10 bg-cream/50 p-3 pl-11 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="teacher-field md:col-span-2">
            <label className={labelClass}>Timer per Soal</label>
            <div className="relative">
              <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-sora/40" size={19} />
              <input
                type="number"
                placeholder="Contoh: 15"
                value={timer}
                onChange={(e) =>
                  setTimer(parseInt(e.target.value) || 0)
                }
                className="w-full border-2 border-sora/10 bg-cream/50 p-3 pl-11 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
              />
            </div>
            <p className={`${hintClass} text-left`}>Waktu dihitung dalam detik.</p>
          </div>
        </div>

      </div>

      {/* LIST */}
      <div className="flex flex-col gap-5">

        {questions.map((q, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-3xl shadow-soft-sora"
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
                className="w-full border-2 border-sora/10 bg-cream/50 p-3 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
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
                  className="w-full border-2 border-sora/10 bg-cream/50 p-3 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
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
                        className="flex-1 border-2 border-sora/10 bg-cream/50 p-3 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
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
                    className="w-full border-2 border-sora/10 bg-cream/50 p-3 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
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
                    className="w-full border-2 border-sora/10 bg-cream/50 p-3 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
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
                        className="flex-1 border-2 border-sora/10 bg-cream/50 p-3 rounded-2xl outline-none focus:border-kaili focus:bg-white transition-all"
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
                        className="bg-kaili text-white px-4 py-2 rounded-2xl flex items-center gap-2 transition hover:bg-kaili/90"
                      >
                        <span>{block}</span> <FiX size={16} />
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
      </div> {/* END KOLOM KIRI */}

      {/* KOLOM KANAN (SIDEBAR DESKTOP) */}
      <div className="hidden lg:flex lg:col-span-4 flex-col gap-5">
        <div className="sticky top-6 flex flex-col gap-5">
          
          {/* WIDGET TAMBAH SOAL */}
          <div className="bg-white p-5 rounded-3xl shadow-soft-sora border border-sora/5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-sora/5 pb-3">
              <p className="text-base font-black text-gray-800">Tambah Soal</p>
              <div className="bg-cream text-kaili px-3 py-1 rounded-full text-xs font-bold">
                {questions.length} Soal
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              {questionTypes.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addQuestion(item.type)}
                  className="group flex w-full items-center justify-between rounded-2xl border-2 border-sora/5 bg-cream/30 px-4 py-3 font-bold text-sora transition hover:-translate-y-1 hover:border-kaili/40 hover:bg-white hover:shadow-soft-sora active:scale-95"
                >
                  <span>{item.label}</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sora/5 text-sora transition group-hover:bg-kaili group-hover:text-white"><FiPlus size={14} /></span>
                </button>
              ))}
            </div>
          </div>

          {/* WIDGET AKSI */}
          <div className="bg-white p-5 rounded-3xl shadow-soft-sora border border-sora/5">
            <p className="mb-4 text-sm font-semibold text-gray-500">Tindakan</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={submitRoom}
                className="w-full bg-kaili text-white px-6 py-3.5 rounded-2xl font-black shadow-glow-kaili btn-bouncy flex items-center justify-center gap-2"
              >
                <FiCheckCircle size={20} /> Buat Room
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/guru")}
                className="w-full bg-cream text-sora px-6 py-3.5 rounded-2xl font-bold hover:bg-sora/10 transition-colors flex items-center justify-center gap-2"
              >
                Batal
              </button>
            </div>
          </div>

        </div>
      </div> {/* END KOLOM KANAN */}

      {/* MOBILE FLOATING BAR (Hanya muncul di HP) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-sora/10 pt-3 pb-safe">
        <div className="mb-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-gray-500">Tambah Tipe Soal</p>
            <span className="text-[10px] text-sora/50 font-medium animate-pulse flex items-center">
              Geser <FiChevronRight size={12} className="ml-0.5" />
            </span>
          </div>
          <span className="bg-cream text-kaili px-2 py-0.5 rounded-full text-[10px] font-bold">
            {questions.length} Soal
          </span>
        </div>
        
        {/* Scroll Container yang melebar ke ujung layar */}
        <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-3 mb-1 px-4 snap-x snap-mandatory">
          {questionTypes.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => addQuestion(item.type)}
              className="snap-start flex-none whitespace-nowrap bg-cream/50 border border-sora/5 text-sora px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition hover:bg-white hover:border-kaili/40 active:scale-95 flex items-center gap-1.5"
            >
              {item.label} <span className="bg-sora/5 p-0.5 rounded-full"><FiPlus size={12} /></span>
            </button>
          ))}
          {/* Spacer untuk memastikan item terakhir bisa di-scroll sepenuhnya */}
          <div className="snap-start flex-none w-1"></div>
        </div>

        <div className="flex gap-3 px-4 pb-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/guru")}
            className="flex-[1] bg-cream text-sora py-3 rounded-xl font-bold text-sm hover:bg-sora/10 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={submitRoom}
            className="flex-[2] bg-kaili text-white py-3 rounded-xl font-bold text-sm shadow-glow-kaili btn-bouncy flex items-center justify-center gap-2"
          >
            <FiCheckCircle size={18} /> Buat Room
          </button>
        </div>
      </div>

      </div>
      </div>
    </div>
  );
}

export default BuatRoom;
