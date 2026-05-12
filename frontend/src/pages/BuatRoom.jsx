import { useState } from "react";
import { useNavigate } from "react-router-dom";

function BuatRoom() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [timer, setTimer] = useState(15);

  const [questions, setQuestions] = useState([]);

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

    if (file.size > 2000000) {
      alert("Gambar maksimal 2MB");
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

      const res = await fetch(
        "http://localhost:3000/api/rooms/create",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
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
    <div className="max-w-5xl mx-auto p-4">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-5">
        🎯 Buat Room
      </h1>

      {/* ROOM */}
      <div className="bg-white p-5 rounded-2xl shadow mb-5">

        <input
          type="text"
          placeholder="Judul Room"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-3"
        />

        <input
          type="text"
          placeholder="Kategori"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-3"
        />

        <input
          type="number"
          placeholder="Timer"
          value={timer}
          onChange={(e) =>
            setTimer(e.target.value)
          }
          className="w-full border p-3 rounded-xl"
        />

      </div>

      {/* BUTTON */}
      <div className="flex flex-wrap gap-3 mb-5">

        <button
          onClick={() =>
            addQuestion("multiple")
          }
          className="bg-blue-500 text-white px-4 py-2 rounded-xl"
        >
          + Pilihan Ganda
        </button>

        <button
          onClick={() =>
            addQuestion("susun")
          }
          className="bg-green-500 text-white px-4 py-2 rounded-xl"
        >
          + Susun Kata
        </button>

        <button
          onClick={() =>
            addQuestion("gambar")
          }
          className="bg-yellow-500 text-white px-4 py-2 rounded-xl"
        >
          + Soal Gambar
        </button>

        <button
          onClick={() =>
            addQuestion("sambung")
          }
          className="bg-purple-500 text-white px-4 py-2 rounded-xl"
        >
          + Sambung Kalimat
        </button>

      </div>

      {/* LIST */}
      <div className="space-y-5">

        {questions.map((q, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow"
          >

            <h2 className="font-bold mb-4">
              Soal #{index + 1}
            </h2>

            {/* PERTANYAAN */}
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
              className="w-full border p-3 rounded-xl mb-4"
            />

            {/* GAMBAR */}
            {q.type === "gambar" && (
              <div className="mb-4">

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
                  value={q.answerType}
                  onChange={(e) =>
                    updateQuestion(
                      index,
                      "answerType",
                      e.target.value
                    )
                  }
                  className="w-full border p-3 rounded-xl"
                >
                  <option value="pilihan">
                    Pilihan Ganda
                  </option>

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
                        className="flex-1 border p-2 rounded-xl"
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

                <select
                  value={q.answer}
                  onChange={(e) =>
                    updateQuestion(
                      index,
                      "answer",
                      e.target.value
                    )
                  }
                  className="w-full border p-3 rounded-xl"
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

              </>
            )}

            {/* TEXT */}
            {(q.type === "gambar" ||
              q.type === "sambung") &&
              q.answerType ===
                "ketik" && (
                <input
                  type="text"
                  placeholder="Jawaban Benar"
                  value={q.answer}
                  onChange={(e) =>
                    updateQuestion(
                      index,
                      "answer",
                      e.target.value
                    )
                  }
                  className="w-full border p-3 rounded-xl"
                />
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
                    <input
                      key={bIndex}
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
                      className="w-full border p-2 rounded-xl mb-2"
                    />
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

          </div>
        ))}

      </div>

      {/* SUBMIT */}
      <button
        onClick={submitRoom}
        className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold mt-6"
      >
        🚀 Buat Room
      </button>

    </div>
  );
}

export default BuatRoom;
