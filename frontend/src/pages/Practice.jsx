import { FaStar, FaRocket } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

import Navbar from "../components/Navbar";
import { Skeleton } from "../components/Skeleton";
import { filterByLevel, getBab, getLevel } from "../data/levelMap";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PRACTICE_QUESTION_COUNT = 5;

const shuffleOptions = (items) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

const preparePracticeItem = (item) => ({
  ...item,
  options: Array.isArray(item.options)
    ? shuffleOptions(item.options)
    : item.options,
  blocks: Array.isArray(item.blocks)
    ? shuffleOptions(item.blocks)
    : item.blocks,
});

const pickPracticeQuestions = (items, bab, level) => {
  const filtered = filterByLevel(items, bab, level);
  const pool = level ? filtered : items;
  const shuffled = shuffleOptions(pool);
  const questions = shuffled.slice(0, PRACTICE_QUESTION_COUNT);

  for (let i = 0; questions.length < PRACTICE_QUESTION_COUNT && shuffled.length > 0; i += 1) {
    questions.push({ ...shuffled[i % shuffled.length] });
  }

  return questions
    .map(preparePracticeItem);
};

function Practice() {
  const { dialect, bab, level } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [correctOption, setCorrectOption] = useState(null);

  const babInfo = getBab(bab);
  const levelInfo = getLevel(bab, level);

  const lessonPath = level
    ? `/lesson/${dialect}/${bab}/${level}`
    : `/lesson/${dialect}/${bab}`;
  const quizPath = level
    ? `/quiz/${dialect}/${bab}/${level}`
    : `/lesson/${dialect}/${bab}/quiz`;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/practice/${dialect}/${bab}`)
      .then((res) => res.json())
      .then((result) => {
        if (Array.isArray(result)) {
          const filtered = pickPracticeQuestions(result, bab, level);

          setData(filtered);
          setIndex(0);
          setIsCompleted(false);
        } else {
          setData([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dialect, bab, level]);

  if (data.length === 0) {
    return (
      <div className="flex h-screen overflow-hidden genz-bg text-sora">
        <Navbar showBackButton backTo={lessonPath} />
        <main className="p-5 max-w-xl mx-auto space-y-5">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  const current = data[index];
  const options = current?.blocks ?? current?.options ?? [];

  const checkAnswer = (option) => {
    if (isEvaluating) return;
    
    setSelectedOption(option);
    setIsEvaluating(true);

    // Memberi jeda 150ms agar animasi "Selected" (border emas) terlihat dulu
    setTimeout(() => {
      if (option === current.answer) {
        setFeedback("correct");
        setCorrectOption(option);
      } else {
        setFeedback("wrong");
        setCorrectOption(current.answer);
      }

      // Memberi jeda 1000ms untuk menampilkan animasi sukses/salah sebelum lanjut soal
      setTimeout(() => {
        setSelectedOption(null);
        setFeedback(null);
        setCorrectOption(null);
        setIsEvaluating(false);

        if (index + 1 < data.length) {
          setIndex(index + 1);
        } else {
          setIsCompleted(true);
        }
      }, 1000);
    }, 150);
  };

  if (isCompleted) {
    return (
      <div className="h-screen overflow-hidden genz-bg text-sora">
        <Navbar showBackButton backTo={lessonPath} />

        <main className="p-5 max-w-xl mx-auto">
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-soft-sora border border-white/60 text-center">
            <p className="text-sm font-black text-kaili mb-2">
              <span className="inline-flex items-center gap-2 text-yellow-500">Latihan Selesai <FaStar /></span>
            </p>
            <h1 className="text-2xl font-black mb-3 text-sora">
              Ingin Lanjut ke Kuis?
            </h1>
            <p className="text-sora/60 mb-6">
              Kamu bisa langsung mengerjakan quiz atau kembali dulu ke materi.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => navigate(lessonPath, { replace: true })}
                className="w-full py-3 rounded-full border-2 border-sora bg-white/50 font-black text-sora hover:bg-sora hover:text-cream transition-all btn-bouncy"
              >
                Kembali ke materi
              </button>
              <button
                onClick={() => navigate(quizPath, { replace: true })}
                className="w-full py-3 rounded-full bg-sora text-white font-black shadow-soft-sora transition-all hover:scale-105 btn-bouncy"
              >
                <span className="inline-flex items-center justify-center gap-2">Ya, lanjut kuis <FaRocket /></span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden genz-bg text-sora">
      <Navbar showBackButton backTo={lessonPath} />

      <main className="p-5 max-w-xl mx-auto">
        <div className="bg-sora text-cream rounded-3xl p-6 mb-5 shadow-soft-sora relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-kaili/20 rounded-full blur-2xl"></div>
          <h1 className="text-2xl font-black">Latihan Bahasa Kaili</h1>

          <p className="text-cream/80 font-medium mt-1">
            {dialect.toUpperCase()} - {levelInfo?.title || babInfo?.title || bab.toUpperCase()}
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-soft-sora border border-white/60">
          <p className="text-sm text-sora/60 mb-2 font-black tracking-widest uppercase">
            Soal {index + 1} / {data.length}
          </p>

          <h2 className="text-xl font-black text-sora mb-5">{current.question}</h2>

          {current.image && (
            <img
              src={current.image}
              alt={current.question}
              className="w-full h-48 object-contain rounded-2xl bg-cream border-none mb-5"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            {options.map((option, i) => {
              let btnClass = "student-answer-button p-4 bg-white border-2 border-sora/10 shadow-sm rounded-3xl font-black text-lg text-sora transition-all btn-bouncy relative overflow-hidden flex items-center justify-center text-center hover:border-kaili";

              if (isEvaluating) {
                if (selectedOption === option) {
                  if (feedback === "correct") {
                    btnClass = "p-4 bg-green-500 border-2 border-green-500 rounded-3xl font-black text-lg text-white shadow-soft-sora relative overflow-hidden flex items-center justify-center text-center";
                  } else if (feedback === "wrong") {
                    btnClass = "p-4 bg-red-500 border-2 border-red-500 rounded-3xl font-black text-lg text-white animate-shake-x relative overflow-hidden flex items-center justify-center text-center";
                  } else {
                    // Selected state before evaluating
                    btnClass = "p-4 bg-white border-2 border-kaili shadow rounded-3xl font-black text-lg text-sora scale-95 flex items-center justify-center text-center";
                  }
                } else if (option === correctOption && feedback === "wrong") {
                  // Color hinting for the actual correct option when user chose wrong
                  btnClass = "p-4 bg-green-50 border-2 border-green-500 rounded-3xl font-black text-lg text-green-700 shadow-soft-sora shadow-glow-kaili flex items-center justify-center text-center";
                } else {
                  // Unselected options during evaluation
                  btnClass = "p-4 bg-sora/5 border-2 border-transparent rounded-3xl font-bold text-lg text-sora/40 opacity-60 flex items-center justify-center text-center";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => checkAnswer(option)}
                  disabled={isEvaluating}
                  className={btnClass}
                >
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}

            {options.length === 0 && (
              <div className="col-span-2 text-center text-gray-500">
                Data jawaban tidak tersedia.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Practice;
