import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiTarget } from "react-icons/fi";
import { FaRocket } from "react-icons/fa";

import { Skeleton } from "../components/Skeleton";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function QuizRoom() {

  const { code } = useParams();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] = useState({});

  // =====================================
  // FETCH ROOM
  // =====================================
  useEffect(() => {

    const fetchRoom = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_BASE_URL}/api/rooms/join/${code}`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {

          alert(data.message);
          return;

        }

        setRoom(data.room);

      } catch (err) {

        console.log(err);
        alert("Gagal mengambil room");

      } finally {

        setLoading(false);

      }

    };

    fetchRoom();

  }, [code]);

  // =====================================
  // JAWABAN
  // =====================================
  const saveAnswer = (value) => {

    setAnswers({
      ...answers,
      [currentQuestion]: value,
    });

  };

  // =====================================
  // NEXT
  // =====================================
  const nextQuestion = () => {

    if (
      currentQuestion <
      room.questions.length - 1
    ) {

      setCurrentQuestion(
        currentQuestion + 1
      );

    }

  };

  // =====================================
  // PREV
  // =====================================
  const prevQuestion = () => {

    if (currentQuestion > 0) {

      setCurrentQuestion(
        currentQuestion - 1
      );

    }

  };

  // =====================================
  // SUBMIT
  // =====================================
  const submitQuiz = () => {

    console.log("Jawaban:", answers);

    alert("Jawaban berhasil dikirim!");

  };

  // =====================================
  // LOADING
  // =====================================
  if (loading) {

    return (
      <div className="h-screen overflow-hidden genz-bg p-4 flex items-center justify-center">
        <div className="max-w-3xl w-full space-y-5">
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );

  }

  if (!room) return null;

  const question =
    room.questions[currentQuestion];

  return (

    <div className="h-screen overflow-y-auto overflow-x-hidden genz-bg p-4 text-sora pb-20">
      <div className="max-w-3xl mx-auto pt-6">

        {/* HEADER */}
        <div className="bg-sora text-cream flex flex-col md:flex-row justify-between items-center mb-5 rounded-3xl p-6 shadow-soft-sora relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-32 h-32 bg-kaili/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 w-full flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black flex items-center gap-2">
                <FiTarget size={24} className="text-kaili" /> {room.title}
              </h1>
              <p className="text-cream/80 font-medium mt-1">
                Room: {code}
              </p>
            </div>

            <div className="text-xl font-black text-kaili drop-shadow-md">
              Soal {currentQuestion + 1}/{room.questions.length}
            </div>
          </div>
        </div>

        {/* CARD SOAL */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-soft-sora border border-white/60">

          {/* PERTANYAAN */}
          <h2 className="text-2xl font-black mb-6 text-sora">
            {question.question}
          </h2>

          {/* ================================= */}
          {/* SOAL GAMBAR */}
          {/* ================================= */}
          {question.image && (

              <img
              src={question.image}
              alt="soal"
              className="w-full max-h-80 object-contain rounded-2xl bg-cream mb-5"
            />

          )}

          {/* ================================= */}
          {/* PILIHAN GANDA */}
          {/* ================================= */}
          {(question.answerType ===
            "pilihan" ||
            question.type === "multiple") && (

            <div className="space-y-3">

              {question.options.map(
                (opt, index) => (

                  <button
                    key={index}
                    onClick={() => saveAnswer(opt)}
                    className={`w-full p-4 rounded-full border-2 text-lg font-black transition-all btn-bouncy shadow-sm ${
                      answers[currentQuestion] === opt
                        ? "bg-kaili text-white border-kaili shadow-glow-kaili"
                        : "bg-white text-sora border-sora/10 hover:border-kaili"
                    }`}
                  >
                    {opt}
                  </button>

                )
              )}

            </div>

          )}

          {/* ================================= */}
          {/* JAWABAN KETIK */}
          {/* ================================= */}
          {question.answerType ===
            "ketik" && (

              <input
              type="text"
              placeholder="Ketik jawaban..."
              value={answers[currentQuestion] || ""}
              onChange={(e) => saveAnswer(e.target.value)}
              className="w-full border-2 border-white/60 p-4 rounded-full bg-white/50 backdrop-blur-md outline-none focus:bg-white focus:border-kaili font-black text-center text-xl text-sora transition-all"
            />

          )}

          {/* ================================= */}
          {/* BLOK KATA */}
          {/* ================================= */}
          {question.answerType ===
            "blok" && (

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">

                {question.blocks.map(
                  (block, index) => (

                    <button
                      key={index}
                      onClick={() => {

                        const current =
                          answers[
                            currentQuestion
                          ] || [];

                        if (
                          current.includes(block)
                        ) {

                          saveAnswer(
                            current.filter(
                              (b) =>
                                b !== block
                            )
                          );

                        } else {

                          saveAnswer([
                            ...current,
                            block,
                          ]);

                        }

                      }}
                      className={`p-4 rounded-3xl border-2 font-black text-lg transition-all btn-bouncy shadow-sm ${
                        (answers[currentQuestion] || []).includes(block)
                          ? "bg-kaili text-white border-kaili shadow-glow-kaili"
                          : "bg-white text-sora border-sora/10 hover:border-kaili"
                      }`}
                    >
                      {block}
                    </button>

                  )
                )}

              </div>

              <div className="bg-white/50 p-4 border border-white/60 rounded-3xl text-center text-2xl md:text-3xl font-black text-sora min-h-[80px] flex flex-wrap items-center justify-center shadow-inner break-words">
                {(answers[currentQuestion] || []).join(" ") || "..."}
              </div>

            </div>

          )}

          {/* NAVIGATION */}
          <div className="flex justify-between gap-3 mt-8">

            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="w-full py-4 rounded-full border-2 border-sora bg-white/50 font-black text-sora hover:bg-sora hover:text-cream transition-all btn-bouncy disabled:opacity-50 disabled:border-sora/20 disabled:text-sora/40 disabled:hover:bg-transparent"
            >
              ← Sebelumnya
            </button>

            {currentQuestion ===
            room.questions.length - 1 ? (

              <button
                onClick={submitQuiz}
                className="w-full bg-kaili text-white py-4 rounded-full font-black shadow-glow-kaili btn-bouncy flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                <FaRocket size={20} /> Submit
              </button>

            ) : (

              <button
                onClick={nextQuestion}
                className="w-full bg-sora text-white py-4 rounded-full font-black shadow-soft-sora btn-bouncy transition-all hover:scale-[1.02]"
              >
                Selanjutnya →
              </button>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}

export default QuizRoom;
