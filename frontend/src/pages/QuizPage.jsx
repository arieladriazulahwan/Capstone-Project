import { useEffect, useRef, useState } from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";
import { FiClock, FiTarget } from "react-icons/fi";

import { Skeleton } from "../components/Skeleton";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function normalizeQuestion(q) {
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
}

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
  const transitionInProgress = useRef(false);
  const submitInProgress = useRef(false);
  const timerRef = useRef(null);

  async function submitQuiz(latestAnswers = answers) {
    if (submitInProgress.current) return;

    submitInProgress.current = true;

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
          body: JSON.stringify({ answers: latestAnswers }),
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
    } finally {
      submitInProgress.current = false;
      transitionInProgress.current = false;
    }
  }

  function continueQuiz(latestAnswers = answers) {
    if (transitionInProgress.current || submitInProgress.current) return;

    transitionInProgress.current = true;
    clearTimeout(timerRef.current);

    if (currentQuestion < room.questions.length - 1) {
      setCurrentQuestion((questionIndex) => questionIndex + 1);
      setTimeLeft(room.timer || 0);
    } else {
      submitQuiz(latestAnswers);
    }
  }

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

  // =====================================
  // TIMER
  // =====================================
  useEffect(() => {
    if (!room || room.questions.length === 0 || quizResult) return;

    timerRef.current = setTimeout(() => {
      if (timeLeft <= 1) {
        alert("Waktu Habis!");
        continueQuiz();
        return;
      }

      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, room, quizResult, timeLeft]);

  useEffect(() => {
    transitionInProgress.current = false;
  }, [currentQuestion]);

  // =====================================
  // SIMPAN JAWABAN
  // =====================================
  const saveAnswer = (value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion]: value,
    }));
  }

  const answerAndContinue = (value) => {
    const latestAnswers = {
      ...answers,
      [currentQuestion]: value,
    };

    setAnswers(latestAnswers);
    continueQuiz(latestAnswers);
  };

  // =====================================
  // LOADING
  // =====================================
  if (loading) {
    return (
      <div className="genz-bg h-screen overflow-hidden p-4 flex items-center justify-center">
        <div className="max-w-3xl mx-auto space-y-5 w-full">
          <Skeleton className="h-28 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
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
      <div className="h-screen overflow-hidden flex items-center justify-center">
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
      <div className="genz-bg h-screen overflow-hidden p-5 flex items-center justify-center text-sora">
        <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora p-6 sm:p-8 rounded-3xl max-w-md w-full text-center relative overflow-hidden">
          <div className="quiz-result-spark spark-one"></div>
          <div className="quiz-result-spark spark-two"></div>
          <div className="quiz-result-spark spark-three"></div>
          <p className="inline-flex items-center rounded-xl bg-kaili/10 px-4 py-1.5 text-xs font-black text-kaili uppercase tracking-wider mb-4 border border-kaili/20">
            Quiz room selesai
          </p>
          <h2 className="text-3xl font-black mb-2 text-sora">{resultTitle}</h2>
          <p className="text-sm font-bold text-sora/60 mb-8">
            Kuis Room {room.title} telah diselesaikan.
          </p>

          <div
            className="quiz-score-ring mx-auto mb-8"
            style={{ "--score": `${percentage * 3.6}deg` }}
          >
            <div className="quiz-score-ring-inner">
              <span className="text-5xl font-black text-kaili">{percentage}</span>
              <span className="text-xs font-black text-sora/40 uppercase tracking-widest mt-1">Nilai</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl shadow-sm">
              <p className="text-xs text-green-600 font-black uppercase tracking-wider">Benar</p>
              <p className="text-3xl font-black text-green-500">{correct}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl shadow-sm">
              <p className="text-xs text-red-500 font-black uppercase tracking-wider">Salah</p>
              <p className="text-3xl font-black text-red-500">{wrong}</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="w-full bg-kaili text-white py-4 rounded-xl font-bold text-lg shadow-glow-kaili transition-all hover:-translate-y-1"
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
    <div className="genz-bg h-screen overflow-hidden p-4 text-sora pb-20">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora rounded-3xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-sora flex items-center gap-2 mb-1">
              <FiTarget size={28} className="text-kaili" /> {room.title}
            </h1>
            <p className="text-sm font-bold text-sora/60 flex items-center gap-1.5 uppercase tracking-wider">
              Room: <span className="bg-sora/10 px-2 py-0.5 rounded-md text-sora">{code}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className={`text-xl sm:text-2xl font-black flex items-center gap-1 ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-sora"}`}>
              <FiClock size={24} className={timeLeft <= 5 ? "text-red-500" : "text-kaili"} /> {timeLeft}s
            </div>
            <div className="bg-kaili/10 border border-kaili/20 text-kaili px-4 py-1.5 rounded-xl text-sm font-black uppercase tracking-wider">
              Soal {currentQuestion + 1}/{room.questions.length}
            </div>
          </div>
        </div>

        {/* CARD SOAL */}
        <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora rounded-3xl p-6 sm:p-8">
          {/* PERTANYAAN */}
          <h2 className="text-2xl font-black text-sora mb-6 leading-relaxed">
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
                  onClick={() => answerAndContinue(opt)}
                  className={`w-full text-left px-5 py-4 rounded-2xl transition-all outline-none font-bold text-lg ${
                    answers[currentQuestion] === opt
                      ? "bg-kaili text-white border-2 border-kaili shadow-md -translate-y-0.5"
                      : "bg-white border-2 border-sora/10 text-sora hover:border-kaili hover:text-kaili hover:bg-sora/5 focus:border-kaili"
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
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ketik jawaban di sini..."
                value={answers[currentQuestion] || ""}
                onChange={(e) => saveAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && String(answers[currentQuestion] || "").trim()) {
                    answerAndContinue(answers[currentQuestion]);
                  }
                }}
                className="w-full border-2 border-sora/20 bg-white/50 p-4 rounded-2xl focus:border-kaili focus:ring-4 focus:ring-kaili/10 outline-none text-sora font-bold text-lg transition-all"
              />

              <button
                type="button"
                onClick={() => answerAndContinue(answers[currentQuestion])}
                disabled={!String(answers[currentQuestion] || "").trim()}
                className="w-full bg-kaili text-white px-6 py-4 rounded-xl font-bold text-lg shadow-glow-kaili transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Jawab
              </button>
            </div>
          )}

          {/* ================================= */}
          {/* BLOK KATA / SUSUN */}
          {/* ================================= */}
          {renderType === "susun_kata" && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3 p-4 bg-sora/5 border border-sora/10 rounded-2xl">
                {question.blocks?.map((block, index) => {
                  const currentAnswer = Array.isArray(answers[currentQuestion]) ? answers[currentQuestion] : [];
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (currentAnswer.includes(block)) {
                          saveAnswer(currentAnswer.filter((b) => b !== block));
                        } else {
                          saveAnswer([...currentAnswer, block]);
                        }
                      }}
                      className={`px-5 py-3 rounded-xl transition-all font-bold text-lg border-2 ${
                        currentAnswer.includes(block)
                          ? "bg-kaili border-kaili text-white shadow-md -translate-y-0.5"
                          : "bg-white border-sora/10 text-sora hover:border-kaili hover:text-kaili shadow-sm"
                      }`}
                    >
                      {block}
                    </button>
                  );
                })}
              </div>

              <div className="bg-kaili/5 border-2 border-kaili p-5 rounded-2xl">
                <p className="text-xs font-black text-kaili mb-1 uppercase tracking-wider">
                  Susunan Jawaban:
                </p>
                <p className="text-sora font-black text-xl min-h-[30px]">
                  {Array.isArray(answers[currentQuestion]) ? answers[currentQuestion].join(" ") : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => answerAndContinue(answers[currentQuestion])}
                disabled={!Array.isArray(answers[currentQuestion]) || answers[currentQuestion].length === 0}
                className="w-full bg-kaili text-white px-6 py-4 rounded-xl font-bold text-lg shadow-glow-kaili transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Jawab
              </button>
            </div>
          )}

        </div>

      </div>

    </div>

  );

}

export default QuizPage;
