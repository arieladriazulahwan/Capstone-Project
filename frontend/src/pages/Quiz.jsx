import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiClock } from "react-icons/fi";

import Navbar from "../components/Navbar";
import { Skeleton } from "../components/Skeleton";
import { filterByLevel, getBab, getLevel } from "../data/levelMap";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const QUIZ_QUESTION_COUNT = 10;

const shuffleOptions = (items) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const prepareQuizItem = (item) => ({
  ...item,
  answer:
    typeof item.answer === "number" && Array.isArray(item.options)
      ? item.options[item.answer]
      : item.answer,
  options: Array.isArray(item.options)
    ? shuffleOptions(item.options)
    : item.options,
  blocks: Array.isArray(item.blocks)
    ? shuffleOptions(item.blocks)
    : item.blocks,
});

const pickQuizQuestions = (items, bab, level) => {
  const filtered = filterByLevel(items, bab, level);
  const pool = level ? filtered : items;
  const shuffled = shuffleOptions(pool);
  const questions = shuffled.slice(0, QUIZ_QUESTION_COUNT);

  for (let i = 0; questions.length < QUIZ_QUESTION_COUNT && shuffled.length > 0; i += 1) {
    questions.push({ ...shuffled[i % shuffled.length] });
  }

  return questions
    .map(prepareQuizItem);
};

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFinished, setIsFinished] = useState(false);
  const [finalXP, setFinalXP] = useState(0);

  const navigate = useNavigate();
  const { dialect, bab, level } = useParams();
  const babInfo = getBab(bab);
  const levelInfo = getLevel(bab, level);

  const practicePath = level
    ? `/practice/${dialect}/${bab}/${level}`
    : `/practice/${dialect}/${bab}`;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/quiz?dialect=${dialect}&bab=${bab}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = pickQuizQuestions(data, bab, level);

          setQuestions(filtered);
          setIndex(0);
          setScore(0);
          setSelected("");
          setTimeLeft(30);
          setIsFinished(false);
        } else {
          setQuestions([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setQuestions([]);
      });
  }, [dialect, bab, level]);

  useEffect(() => {
    if (questions.length === 0 || isFinished) return;
    
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
  }, [index, questions.length, isFinished]);

  useEffect(() => {
    if (timeLeft === 0 && questions.length > 0 && !isFinished) {
      alert("Waktu habis!");
      nextQuestion(score);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, score, isFinished]);

  if (questions.length === 0) {
    return (
      <div className="h-screen overflow-hidden genz-bg text-sora flex flex-col">
        <Navbar showBackButton backTo={practicePath} />
        <div className="p-5 max-w-xl mx-auto space-y-4">
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const current = questions[index];
  const hasBlocks = Array.isArray(current.blocks) && current.blocks.length > 0;
  const hasOptions = !hasBlocks && Array.isArray(current.options) && current.options.length > 0;
  const hasTextAnswer = !hasOptions && !hasBlocks;

  async function nextQuestion(updatedScore) {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected("");
      setTimeLeft(30);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const earnedXP = updatedScore * 10;

      if (bab) {
        const progressRes = await fetch(`${API_BASE_URL}/api/auth/complete-bab`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            bab,
            dialect,
            level,
            score: updatedScore,
            total: questions.length,
          }),
        });

        if (!progressRes.ok) {
          const progressError = await progressRes.json().catch(() => ({}));
          throw new Error(progressError.message || "Gagal update progress level");
        }
      }

      // Lewati hit API add-xp jika skor = 0 agar terhindar dari Error 400 API Gamifikasi
      if (earnedXP > 0) {
        const xpRes = await fetch(`${API_BASE_URL}/api/auth/add-xp`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            xp: earnedXP,
          }),
        });

        const result = await xpRes.json();
        if (!xpRes.ok) {
          throw new Error(result.message || "Gagal menambahkan XP");
        }
        console.log("XP RESULT:", result);
      }

      // Tampilkan halaman result
      setFinalXP(earnedXP);
      setIsFinished(true);
    } catch (err) {
      console.log("ERROR:", err);
      alert(err.message || "Gagal menyimpan hasil quiz");
    }
  };

  const answerHandler = (option) => {
    let updatedScore = score;

    if (option === current.answer) {
      updatedScore += 1;
      setScore(updatedScore);
    }

    nextQuestion(updatedScore);
  };

  const blockHandler = (block) => {
    setSelected((currentSelected) => currentSelected + block);
  };

  const submitBlockAnswer = () => {
    if (!selected.trim()) {
      alert(hasTextAnswer ? "Ketik jawaban dulu" : "Susun jawaban dulu");
      return;
    }

    let updatedScore = score;
    const userAnswer = selected.trim().toLowerCase();
    const correctAnswer = current.answer.trim().toLowerCase();

    if (userAnswer === correctAnswer) {
      updatedScore += 1;
      setScore(updatedScore);
    }

    nextQuestion(updatedScore);
  };

  // TAMPILAN RESULT
  if (isFinished) {
    const correct = score;
    const wrong = questions.length - score;
    const percentage = Math.round((correct / questions.length) * 100);
    const resultTitle =
      percentage >= 80 ? "Hebat, level ini makin terbuka" :
      percentage >= 50 ? "Bagus, terus latih lagi" :
      "Tetap semangat, coba lagi pelan-pelan";

    return (
      <div className="h-screen overflow-hidden genz-bg p-5 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 p-6 sm:p-8 rounded-3xl shadow-soft-sora max-w-md w-full text-center text-sora relative overflow-hidden">
          <div className="quiz-result-spark spark-one"></div>
          <div className="quiz-result-spark spark-two"></div>
          <div className="quiz-result-spark spark-three"></div>
          <p className="inline-flex items-center rounded-full bg-cream px-4 py-1 text-xs font-bold text-kaili mb-4">
            Quiz selesai
          </p>
          <h2 className="text-3xl font-bold mb-2 text-sora">{resultTitle}</h2>
          <p className="text-sora/60 mb-6">
            Kuis {levelInfo?.title || `Level ${level || "-"}`} berhasil diselesaikan.
          </p>

          <div
            className="quiz-score-ring mx-auto mb-6"
            style={{ "--score": `${percentage * 3.6}deg` }}
          >
            <div className="quiz-score-ring-inner">
              <span className="text-5xl font-black text-sora">{percentage}</span>
              <span className="text-sm font-bold text-sora/60">Nilai</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-cream p-4 rounded-3xl shadow-soft-sora">
              <p className="text-xs text-kaili font-bold uppercase tracking-wide">Benar</p>
              <p className="text-3xl font-black text-sora">{correct}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-3xl shadow-soft-sora">
              <p className="text-xs text-red-500 font-bold uppercase tracking-wide">Salah</p>
              <p className="text-3xl font-black text-red-600">{wrong}</p>
            </div>
            <div className="bg-cream p-4 rounded-3xl col-span-2 shadow-soft-sora">
              <p className="text-xs text-kaili font-bold uppercase tracking-wide">XP Didapat</p>
              <p className="text-2xl font-black text-kaili">+{finalXP} XP</p>
            </div>
          </div>

          <button
            onClick={() => navigate(level ? `/level/${dialect}/${bab}` : "/level", { replace: true })}
            className="w-full bg-sora text-white py-4 rounded-full font-black text-lg shadow-soft-sora transition-all hover:scale-105 btn-bouncy"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden genz-bg text-sora flex flex-col">
      <Navbar showBackButton backTo={practicePath} />

      <main className="p-5 w-full max-w-xl mx-auto overflow-y-auto overflow-x-hidden flex-1">
        <div className="bg-sora text-cream flex justify-between items-center mb-5 rounded-3xl p-6 shadow-soft-sora relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-32 h-32 bg-kaili/20 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-black">Kuis Bahasa Kaili</h1>
            <p className="text-cream/80 font-medium mt-1">
              {dialect.toUpperCase()} - {levelInfo?.title || babInfo?.title || bab.toUpperCase()}
            </p>
          </div>
          <div className={`text-xl font-black flex items-center gap-1 z-10 ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-kaili drop-shadow-md"}`}>
            <FiClock size={20} /> {timeLeft}s
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-soft-sora border border-white/60">
          <p className="text-sm text-sora/60 font-black tracking-widest uppercase mb-2">
            Soal {index + 1} / {questions.length}
          </p>

          <h2 className="text-xl font-black text-sora mb-5">{current.question}</h2>

          {current.image && (
            <img
              src={current.image}
              alt={current.question}
              className="w-full h-48 object-contain rounded-2xl bg-cream border-none mb-5"
            />
          )}

          {hasOptions && (
            <div className="flex flex-col gap-3">
              {current.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answerHandler(opt)}
                  className="student-answer-button p-4 rounded-full border-2 border-sora/10 shadow-sm bg-white text-sora font-black hover:bg-white hover:border-kaili transition-all btn-bouncy"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {hasBlocks && (
            <>
              <div className="mb-5 p-4 bg-cream rounded-3xl text-center text-2xl md:text-3xl font-black text-sora min-h-[80px] flex flex-wrap items-center justify-center break-words">
                {selected || "..."}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {current.blocks?.map((block, i) => (
                  <button
                    key={i}
                    onClick={() => blockHandler(block)}
                    className="student-answer-button p-4 rounded-3xl bg-white border-2 border-sora/10 shadow-sm font-black text-lg text-sora hover:border-kaili transition-all btn-bouncy"
                  >
                    {block}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => setSelected("")}
                  className="w-full bg-red-50 text-red-500 py-4 rounded-full border-2 border-red-500 font-bold hover:bg-red-500 hover:text-white transition-all btn-bouncy"
                >
                  Reset
                </button>
                <button
                  onClick={submitBlockAnswer}
                  className="w-full bg-sora text-white py-4 rounded-full font-black shadow-soft-sora btn-bouncy"
                >
                  Jawab
                </button>
              </div>
            </>
          )}

          {hasTextAnswer && (
            <>
              <input
                type="text"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                placeholder="Ketik jawaban..."
                className="w-full border-2 border-white/60 p-4 rounded-full bg-white/50 backdrop-blur-md outline-none focus:bg-white focus:border-kaili font-black text-center text-xl text-sora transition-all"
              />

              <button
                onClick={submitBlockAnswer}
                className="mt-4 w-full bg-sora text-white py-4 rounded-full font-black shadow-soft-sora btn-bouncy transition-all hover:scale-105"
              >
                Jawab
              </button>
            </>
          )}

          <p className="mt-5 text-sm text-sora/60 font-bold text-center">
            Score sementara: {score}
          </p>
        </div>
      </main>
    </div>
  );
}

export default Quiz;
