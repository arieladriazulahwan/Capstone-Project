import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function QuizPage() {

  const { code } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizResult, setQuizResult] = useState(null);

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

        const questions =
          typeof data.room.questions === "string"
            ? JSON.parse(data.room.questions)
            : data.room.questions;

        const roomData = {
          ...data.room,
          questions: questions.map(normalizeQuestion),
        };

        setRoom(roomData);
        setTimeLeft(roomData.timer || 0);

        console.log("Room data:", roomData);
        console.log("Questions:", questions.map(normalizeQuestion));

      } catch (err) {

        console.log(err);
        alert("Gagal mengambil room");

      } finally {

        setLoading(false);

      }

    };

    fetchRoom();

  }, [code]);

  const normalizeQuestion = (q) => {
    const normalized = { ...q };

    if (q.type === "multiple") {
      normalized.renderType = "pilihan_ganda";
      return normalized;
    }

    if (q.type === "susun") {
      normalized.renderType = "susun_kata";
      return normalized;
    }

    if (q.type === "gambar" || q.type === "sambung") {
      const answerType = String(q.answerType || "").toLowerCase();

      if (answerType === "ketik" || answerType === "text") {
        normalized.renderType = "ketik";
      } else if (answerType === "blok" || answerType === "block") {
        normalized.renderType = "susun_kata";
      } else {
        normalized.renderType = "pilihan_ganda";
      }
      return normalized;
    }

    normalized.renderType = "pilihan_ganda";
    return normalized;
  };

  // =====================================
  // TIMER
  // =====================================
  useEffect(() => {
    if (!room || room.questions.length === 0 || quizResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, room, quizResult]);

  useEffect(() => {
    if (timeLeft === 0 && room && room.questions.length > 0 && !quizResult) {
      alert("Waktu Habis!");
      if (currentQuestion < room.questions.length - 1) {
        nextQuestion();
      } else {
        submitQuiz();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, quizResult]);

  // =====================================
  // SIMPAN JAWABAN
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
      setTimeLeft(room.timer || 0);

    }

  };

  // =====================================
  // SUBMIT
  // =====================================
  const submitQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/rooms/submit/${code}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ answers }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal submit quiz");
        return;
      }

      setQuizResult(data);
    } catch (err) {
      console.log(err);
      alert("Gagal submit quiz");
    }
  };

  // =====================================
  // LOADING
  // =====================================
  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading room...
      </div>
    );

  }

  // =====================================
  // ROOM KOSONG
  // =====================================
  if (
    !room ||
    !room.questions ||
    room.questions.length === 0
  ) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Room belum memiliki soal
      </div>
    );

  }

  // =====================================
  // TAMPILAN RESULT
  // =====================================
  if (quizResult) {
    const correct = quizResult.score;
    const total = quizResult.total;
    const wrong = total - correct;
    const percentage = Math.round((correct / total) * 100);
    const resultTitle =
      percentage >= 80 ? "Kerja bagus, hasilmu kuat" :
      percentage >= 50 ? "Bagus, tinggal dipoles lagi" :
      "Tetap semangat, coba lagi nanti";

    return (
      <div className="quiz-result-bg student-page-bg min-h-screen bg-gray-100 p-5 flex items-center justify-center">
        <div className="quiz-result-card student-hero-card p-6 sm:p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="quiz-result-spark spark-one"></div>
          <div className="quiz-result-spark spark-two"></div>
          <div className="quiz-result-spark spark-three"></div>
          <p className="inline-flex items-center rounded-full bg-green-100 px-4 py-1 text-xs font-bold text-green-700 mb-4">
            Quiz room selesai
          </p>
          <h2 className="text-3xl font-bold mb-2">{resultTitle}</h2>
          <p className="text-gray-500 mb-6">
            Kuis Room {room.title} telah diselesaikan.
          </p>

          <div
            className="quiz-score-ring mx-auto mb-6"
            style={{ "--score": `${percentage * 3.6}deg` }}
          >
            <div className="quiz-score-ring-inner">
              <span className="text-5xl font-black text-green-700">{percentage}</span>
              <span className="text-sm font-bold text-gray-500">Nilai</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="quiz-result-stat bg-green-100 p-4 rounded-2xl shadow-sm">
              <p className="text-xs text-green-700 font-bold uppercase tracking-wide">Benar</p>
              <p className="text-3xl font-black text-green-700">{correct}</p>
            </div>
            <div className="quiz-result-stat bg-red-100 p-4 rounded-2xl shadow-sm">
              <p className="text-xs text-red-700 font-bold uppercase tracking-wide">Salah</p>
              <p className="text-3xl font-black text-red-700">{wrong}</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="w-full flag-wave text-white py-4 rounded-2xl font-bold text-lg transition shadow-lg hover:scale-[1.01]"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question =
    room.questions[currentQuestion];

  const renderType = question.renderType;

  return (

    <div className="student-page-bg min-h-screen bg-gray-100 p-4">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="student-hero-card rounded-3xl p-5 shadow mb-5">

          <div className="flex justify-between items-center">

            <div>

              <h1 className="text-2xl font-bold">
                🎯 {room.title}
              </h1>

              <p className="text-gray-500">
                Room: {code}
              </p>

            </div>

            <div className="flex flex-col items-end gap-2">

              <div className={`text-xl font-bold ${timeLeft <= 5 ? "text-red-500" : "text-green-600"}`}>
                ⏱️ {timeLeft}s
              </div>

              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl font-bold">
                Soal {currentQuestion + 1}/
                {room.questions.length}
              </div>

            </div>

          </div>

        </div>

        {/* CARD SOAL */}
        <div className="student-card bg-white rounded-3xl p-6 shadow">

          {/* PERTANYAAN */}
          <h2 className="text-2xl font-bold mb-6">
            {question.question}
          </h2>

          {/* ================================= */}
          {/* GAMBAR */}
          {/* ================================= */}
          {question.image && (

            <img
              src={question.image}
              alt="soal"
              className="w-full max-h-80 object-cover rounded-2xl mb-5"
            />

          )}

          {/* ================================= */}
          {/* PILIHAN GANDA */}
          {/* ================================= */}
          {renderType === "pilihan_ganda" && (

            <div className="space-y-3">

              {question.options?.map((opt, index) => (

                <button
                  key={index}
                  onClick={() => saveAnswer(opt)}
                  className={`w-full text-left p-4 rounded-2xl border transition ${
                    answers[currentQuestion] === opt
                      ? "bg-green-500 text-white border-green-500"
                      : "student-answer-button bg-white hover:bg-gray-50"
                  }`}
                >
                  {opt}
                </button>

              ))}

            </div>

          )}

          {/* ================================= */}
          {/* JAWABAN KETIK */}
          {/* ================================= */}
          {renderType === "ketik" && (

            <input
              type="text"
              placeholder="Ketik jawaban..."
              value={answers[currentQuestion] || ""}
              onChange={(e) =>
                saveAnswer(e.target.value)
              }
              className="w-full border p-4 rounded-2xl"
            />

          )}

          {/* ================================= */}
          {/* BLOK KATA / SUSUN */}
          {/* ================================= */}
          {renderType === "susun_kata" && (

            <div className="space-y-4">

              <div className="flex flex-wrap gap-3">

                {question.blocks?.map((block, index) => {

                  const currentAnswer =
                    Array.isArray(
                      answers[currentQuestion]
                    )
                      ? answers[currentQuestion]
                      : [];

                  return (

                    <button
                      key={index}
                      onClick={() => {

                        if (
                          currentAnswer.includes(block)
                        ) {

                          saveAnswer(
                            currentAnswer.filter(
                              (b) => b !== block
                            )
                          );

                        } else {

                          saveAnswer([
                            ...currentAnswer,
                            block,
                          ]);

                        }

                      }}
                      className={`px-4 py-3 rounded-2xl border transition ${
                        currentAnswer.includes(block)
                          ? "bg-green-500 text-white"
                          : "student-answer-button bg-white hover:bg-gray-100"
                      }`}
                    >
                      {block}
                    </button>

                  );

                })}

              </div>

              <div className="bg-green-50 p-4 rounded-2xl">

                <p className="font-semibold mb-2">
                  Jawaban:
                </p>

                <p className="text-green-700">
                  {Array.isArray(
                    answers[currentQuestion]
                  )
                    ? answers[currentQuestion].join(" ")
                    : ""}
                </p>

              </div>

            </div>

          )}

          {/* NAVIGATION */}
          <div className="flex justify-end mt-8">

            {currentQuestion ===
            room.questions.length - 1 ? (

              <button
                onClick={submitQuiz}
                className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold"
              >
                🚀 Submit Quiz
              </button>

            ) : (

              <button
                onClick={nextQuestion}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold"
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

export default QuizPage;
