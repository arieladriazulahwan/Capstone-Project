import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { filterByLevel, getBab, getLevel } from "../data/levelMap";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const shuffleOptions = (items) => {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

function Practice() {
  const { dialect, bab, level } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);
  const babInfo = getBab(bab);
  const levelInfo = getLevel(bab, level);

  const lessonPath = level
    ? `/lesson/${dialect}/${bab}/${level}`
    : `/lesson/${dialect}/${bab}`;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/practice/${dialect}/${bab}`)
      .then((res) => res.json())
      .then((result) => {
        if (Array.isArray(result)) {
          const filtered = filterByLevel(result, bab, level).map((item) => ({
            ...item,
            options: Array.isArray(item.options)
              ? shuffleOptions(item.options)
              : item.options,
            blocks: Array.isArray(item.blocks)
              ? shuffleOptions(item.blocks)
              : item.blocks,
          }));

          setData(filtered);
          setIndex(0);
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
      alert("Latihan selesai");
      navigate(
        level
          ? `/quiz/${dialect}/${bab}/${level}`
          : `/lesson/${dialect}/${bab}/quiz`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar showBackButton backTo={lessonPath} />

      <main className="p-5 max-w-xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Latihan Bahasa Kaili</h1>

          <p className="text-gray-500 mt-1">
            {dialect.toUpperCase()} - {levelInfo?.title || babInfo?.title || bab.toUpperCase()}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-sm text-gray-500 mb-2">
            Soal {index + 1} / {data.length}
          </p>

          <h2 className="text-lg font-semibold mb-5">{current.question}</h2>

          <div className="grid grid-cols-2 gap-3">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => checkAnswer(option)}
                className="p-4 bg-blue-100 rounded-xl font-bold text-lg hover:bg-blue-200 transition"
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
