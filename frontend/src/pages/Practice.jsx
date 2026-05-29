import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
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
      <div className="min-h-screen bg-gray-100">
        <Navbar showBackButton backTo={lessonPath} />
        <div className="p-5 text-center">Loading latihan...</div>
      </div>
    );
  }

  const current = data[index];
  const options = current?.blocks ?? current?.options ?? [];

  const checkAnswer = (option) => {
    if (option === current.answer) {
      alert("Benar");
    } else {
      alert("Salah");
    }

    if (index + 1 < data.length) {
      setIndex(index + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isCompleted) {
    return (
      <div className="student-page-bg min-h-screen bg-gray-100">
        <Navbar showBackButton backTo={lessonPath} />

        <main className="p-5 max-w-xl mx-auto">
          <div className="student-hero-card p-6 rounded-3xl shadow text-center">
            <p className="text-sm font-semibold text-green-600 mb-2">
              Latihan selesai
            </p>
            <h1 className="text-2xl font-bold mb-3">
              Ingin lanjut ke quiz?
            </h1>
            <p className="text-gray-500 mb-6">
              Kamu bisa langsung mengerjakan quiz atau kembali dulu ke materi.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => navigate(lessonPath, { replace: true })}
                className="w-full py-3 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition hover:-translate-y-0.5"
              >
                Tidak, kembali ke lesson
              </button>
              <button
                onClick={() => navigate(quizPath, { replace: true })}
                className="w-full py-3 rounded-xl flag-wave text-white font-bold transition shadow hover:-translate-y-0.5"
              >
                Ya, lanjut quiz
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="student-page-bg min-h-screen bg-gray-100">
      <Navbar showBackButton backTo={lessonPath} />

      <main className="p-5 max-w-xl mx-auto">
        <div className="student-hero-card mb-5 rounded-3xl p-5 shadow">
          <h1 className="text-2xl font-bold">Latihan Bahasa Kaili</h1>

          <p className="text-gray-500 mt-1">
            {dialect.toUpperCase()} - {levelInfo?.title || babInfo?.title || bab.toUpperCase()}
          </p>
        </div>

        <div className="student-card bg-white p-5 rounded-2xl shadow">
          <p className="text-sm text-gray-500 mb-2">
            Soal {index + 1} / {data.length}
          </p>

          <h2 className="text-lg font-semibold mb-5">{current.question}</h2>

          {current.image && (
            <img
              src={current.image}
              alt={current.question}
              className="w-full h-48 object-contain rounded-xl bg-gray-50 border border-gray-100 mb-5"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => checkAnswer(option)}
                className="student-answer-button p-4 bg-blue-100 rounded-xl font-bold text-lg hover:bg-blue-200 transition"
              >
                {option}
              </button>
            ))}

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
