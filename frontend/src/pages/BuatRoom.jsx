import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import NavbarGuru from "../components/NavbarGuru";

function BuatRoom() {
  const navigate = useNavigate();

  // ========================================
  // ROOM
  // ========================================

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [timer, setTimer] = useState(30);

  // ========================================
  // QUESTIONS
  // ========================================

  const [questions, setQuestions] = useState([
    {
      type: "multiple",
      question: "",
      options: ["", "", "", ""],
      answer: "",
      image: "",
      blocks: [],
    },
  ]);

  // ========================================
  // ADD QUESTION
  // ========================================

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "multiple",
        question: "",
        options: ["", "", "", ""],
        answer: "",
        image: "",
        blocks: [],
      },
    ]);
  };

  // ========================================
  // UPDATE QUESTION
  // ========================================

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // ========================================
  // UPDATE OPTION
  // ========================================

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  // ========================================
  // HANDLE IMAGE
  // ========================================

  const handleImage = (e, index) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    const updated = [...questions];
    updated[index].image = imageUrl;

    setQuestions(updated);
  };

  // ========================================
  // HANDLE SUBMIT
  // ========================================

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:3000/api/rooms",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            title,
            category,
            timer,
            questions,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(
          `Room berhasil dibuat 🎉\nKode Room: ${data.roomCode}`
        );

        navigate("/dashboard/guru");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar role="guru" />

      <div className="flex-1 flex flex-col">

        <NavbarGuru user={{ name: "Guru" }} />

        <main className="flex-1 p-4 flex justify-center">

          <div className="w-full max-w-4xl">

            {/* HEADER */}
            <div className="bg-white rounded-3xl p-6 shadow mb-5">

              <h1 className="text-2xl font-bold text-blue-600 mb-4">
                🎯 Buat Room Kuis
              </h1>

              {/* ROOM TITLE */}
              <input
                type="text"
                placeholder="Judul Room"
                className="w-full border p-3 rounded-xl mb-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {/* CATEGORY */}
              <input
                type="text"
                placeholder="Kategori"
                className="w-full border p-3 rounded-xl mb-3"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

              {/* TIMER */}
              <select
                className="w-full border p-3 rounded-xl"
                value={timer}
                onChange={(e) => setTimer(e.target.value)}
              >
                <option value={30}>30 Detik</option>
                <option value={60}>60 Detik</option>
                <option value={90}>90 Detik</option>
              </select>
            </div>

            {/* QUESTIONS */}
            <div className="space-y-5">

              {questions.map((q, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-5 shadow"
                >

                  {/* QUESTION HEADER */}
                  <div className="flex justify-between items-center mb-4">

                    <h2 className="font-bold text-lg">
                      Soal {index + 1}
                    </h2>

                    {/* TYPE */}
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(
                          index,
                          "type",
                          e.target.value
                        )
                      }
                      className="border p-2 rounded-xl"
                    >
                      <option value="multiple">
                        Pilihan Ganda
                      </option>

                      <option value="arrange">
                        Susun Kata
                      </option>

                      <option value="image">
                        Tebak Gambar
                      </option>

                      <option value="fill">
                        Isi Jawaban
                      </option>
                    </select>
                  </div>

                  {/* QUESTION */}
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

                  {/* ========================================
                      MULTIPLE CHOICE
                  ======================================== */}

                  {q.type === "multiple" && (
                    <>
                      {q.options.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          placeholder={`Pilihan ${i + 1}`}
                          value={opt}
                          onChange={(e) =>
                            updateOption(
                              index,
                              i,
                              e.target.value
                            )
                          }
                          className="w-full border p-3 rounded-xl mb-2"
                        />
                      ))}

                      <input
                        type="text"
                        placeholder="Jawaban benar"
                        value={q.answer}
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            "answer",
                            e.target.value
                          )
                        }
                        className="w-full border p-3 rounded-xl mt-3"
                      />
                    </>
                  )}

                  {/* ========================================
                      SUSUN KATA
                  ======================================== */}

                  {q.type === "arrange" && (
                    <>
                      <input
                        type="text"
                        placeholder="Contoh: nga,de,nu,ku"
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            "blocks",
                            e.target.value.split(",")
                          )
                        }
                        className="w-full border p-3 rounded-xl mb-3"
                      />

                      <div className="flex gap-2 flex-wrap mb-3">
                        {q.blocks.map((b, i) => (
                          <div
                            key={i}
                            className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl"
                          >
                            {b}
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Jawaban benar contoh: nga de"
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
                    </>
                  )}

                  {/* ========================================
                      IMAGE QUIZ
                  ======================================== */}

                  {q.type === "image" && (
                    <>
                      <input
                        type="file"
                        onChange={(e) =>
                          handleImage(e, index)
                        }
                        className="mb-3"
                      />

                      {q.image && (
                        <img
                          src={q.image}
                          alt=""
                          className="w-40 rounded-xl mb-3"
                        />
                      )}

                      <input
                        type="text"
                        placeholder="Jawaban gambar"
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
                    </>
                  )}

                  {/* ========================================
                      FILL ANSWER
                  ======================================== */}

                  {q.type === "fill" && (
                    <>
                      <p className="text-sm text-gray-500 mb-2">
                        Contoh soal:
                        Saya sedang _____
                      </p>

                      <input
                        type="text"
                        placeholder="Pilihan blok contoh: makan,biru,hilang"
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            "blocks",
                            e.target.value.split(",")
                          )
                        }
                        className="w-full border p-3 rounded-xl mb-3"
                      />

                      <div className="flex gap-2 flex-wrap mb-3">
                        {q.blocks.map((b, i) => (
                          <div
                            key={i}
                            className="bg-green-100 text-green-700 px-4 py-2 rounded-xl"
                          >
                            {b}
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Jawaban benar"
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
                    </>
                  )}
                </div>
              ))}

              {/* ADD QUESTION */}
              <button
                onClick={addQuestion}
                className="w-full bg-gray-200 hover:bg-gray-300 p-4 rounded-2xl font-semibold"
              >
                ➕ Tambah Soal
              </button>

              {/* SUBMIT */}
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-2xl font-bold text-lg"
              >
                🚀 Publish Room
              </button>
            </div>
          </div>
        </main>
      </div>

      <BottomNav role="guru" />
    </div>
  );
}

export default BuatRoom;