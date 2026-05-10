import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Practice() {

  const { dialect, bab } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);

  // 🔥 fetch practice
  useEffect(() => {

    fetch(`http://localhost:3000/api/practice/${dialect}/${bab}`)
      .then((res) => res.json())
      .then((result) => {

        if (Array.isArray(result)) {
          setData(result);
        } else {
          setData([]);
        }

      })
      .catch((err) => {
        console.log(err);
      });

  }, [dialect, bab]);

  // ⏳ loading
  if (data.length === 0) {
    return (
      <div className="p-5 text-center">
        Loading latihan...
      </div>
    );
  }

  const current = data[index];

  // 🔥 cek jawaban
  const checkAnswer = (block) => {

    if (block === current.answer) {
      alert("Benar 👍");
    } else {
      alert("Salah 😅");
    }

    // 🔥 next soal
    if (index + 1 < data.length) {

      setIndex(index + 1);

    } else {

      alert("Latihan selesai 🎉");

      navigate(`/lesson/${dialect}/${bab}/quiz`);

    }
  };

  return (
    <div className="p-5 max-w-xl mx-auto">

      {/* HEADER */}
      <div className="mb-5">

        <h1 className="text-2xl font-bold">
          🧠 Latihan Bahasa Kaili
        </h1>

        <p className="text-gray-500 mt-1">
          Dialek: {dialect.toUpperCase()}
        </p>

      </div>

      {/* CARD */}
      <div className="bg-white p-5 rounded-2xl shadow">

        <p className="text-sm text-gray-500 mb-2">
          Soal {index + 1} / {data.length}
        </p>

        <h2 className="text-lg font-semibold mb-5">
          {current.question}
        </h2>

        {/* BLOK JAWABAN */}
        <div className="grid grid-cols-2 gap-3">

          {current.blocks.map((block, i) => (

            <button
              key={i}
              onClick={() => checkAnswer(block)}
              className="p-4 bg-blue-100 rounded-xl font-bold text-lg hover:bg-blue-200 transition"
            >
              {block}
            </button>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Practice;