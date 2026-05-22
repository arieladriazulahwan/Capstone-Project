import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
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
      <div className="min-h-screen bg-gray-100">
        <Navbar showBackButton backTo={practicePath} />
        <div className="p-5 text-center">Loading quiz...</div>
      </div>
    );
  }

  const current = questions[index];
  const hasBlocks = Array.isArray(current.blocks) && current.blocks.length > 0;
  const hasOptions = !hasBlocks && Array.isArray(current.options) && current.options.length > 0;

  const nextQuestion = async (updatedScore) => {
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
      alert("Susun jawaban dulu");
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

    return (
      <div className="min-h-screen bg-gray-100 p-5 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center transform transition-all">
          <h1 className="text-4xl font-bold mb-2">🎉 Selesai!</h1>
          <p className="text-gray-500 mb-8">Kuis Level {level} berhasil diselesaikan.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-100 p-4 rounded-2xl shadow-sm">
              <p className="text-sm text-green-600 font-bold">Benar</p>
              <p className="text-3xl font-black text-green-700">{correct}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-2xl shadow-sm">
              <p className="text-sm text-red-600 font-bold">Salah</p>
              <p className="text-3xl font-black text-red-700">{wrong}</p>
            </div>
            <div className="bg-blue-100 p-5 rounded-2xl col-span-2 shadow-sm">
              <p className="text-sm text-blue-600 font-bold">Total Nilai</p>
              <p className="text-5xl font-black text-blue-700">{percentage}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-2xl col-span-2 shadow-sm">
              <p className="text-sm text-yellow-600 font-bold">XP Didapat</p>
              <p className="text-2xl font-black text-yellow-700">+{finalXP} XP</p>
            </div>
          </div>

          <button
            onClick={() => navigate(level ? `/level/${dialect}/${bab}` : "/level")}
            className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-600 transition shadow-lg"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar showBackButton backTo={practicePath} />

      <main className="p-5 max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">Quiz Bahasa Kaili</h1>
            <p className="text-gray-500 mt-1">
              {dialect.toUpperCase()} - {levelInfo?.title || babInfo?.title || bab.toUpperCase()}
            </p>
          </div>
          <div className={`text-xl font-bold ${timeLeft <= 5 ? "text-red-500" : "text-green-600"}`}>
            ⏱️ {timeLeft}s
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-sm text-gray-500 mb-2">
            Soal {index + 1} / {questions.length}
          </p>

          <h2 className="text-lg font-semibold mb-5">{current.question}</h2>

          {hasOptions && (
            <div className="flex flex-col gap-3">
              {current.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answerHandler(opt)}
                  className="p-3 rounded-xl border bg-white hover:bg-green-100 transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {hasBlocks && (
            <>
              <div className="mb-5 p-4 bg-gray-100 rounded-xl text-center text-2xl font-bold min-h-[70px] flex items-center justify-center">
                {selected || "..."}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {current.blocks?.map((block, i) => (
                  <button
                    key={i}
                    onClick={() => blockHandler(block)}
                    className="p-4 rounded-xl bg-green-100 font-bold text-lg hover:bg-green-200 transition"
                  >
                    {block}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => setSelected("")}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition"
                >
                  Reset
                </button>
                <button
                  onClick={submitBlockAnswer}
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition"
                >
                  Jawab
                </button>
              </div>
            </>
          )}

          <p className="mt-5 text-sm text-gray-500">
            Score sementara: {score}
          </p>
        </div>
      </main>
    </div>
  );
}

export default Quiz;
