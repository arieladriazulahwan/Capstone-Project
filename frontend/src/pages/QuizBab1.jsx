import { useState } from "react";

const questions = [
  {
    q: "Halo dalam Kaili?",
    options: ["Halo", "Banua", "Ue"],
    answer: "Halo",
  },
  {
    q: "Nama saya dalam Kaili?",
    options: ["Yaku", "Pagi", "Kaju"],
    answer: "Yaku",
  },
];

function QuizBab1() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = async (opt) => {
    let newScore = score;

    // ✅ cek jawaban
    if (opt === questions[index].answer) {
      newScore += 10;
      setScore(newScore);
    }

    // 👉 kalau masih ada soal
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      try {
        // 🔥 KIRIM XP KE BACKEND
        await fetch("http://localhost:3000/api/auth/add-xp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ xp: newScore }),
        });

        await fetch("http://localhost:3000/api/auth/complete-bab", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ bab: "bab1" }),
        });

        // 🎉 ALERT HASIL
        alert("Quiz selesai! XP kamu: " + newScore);

        // ✅ SIMPAN PROGRESS (INI YANG PENTING!)
        localStorage.setItem("bab1_done", "true");

        // 🔁 PAKSA RELOAD BIAR LEVEL UPDATE
        window.location.href = "/level";
      } catch (err) {
        alert("Gagal kirim XP");
        console.log(err);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">

        <h2 className="font-bold text-lg mb-4 text-center">
          {questions[index].q}
        </h2>

        {questions[index].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className="w-full bg-gray-200 p-3 mb-2 rounded-xl hover:bg-gray-300 transition"
          >
            {opt}
          </button>
        ))}

        <p className="text-center text-sm mt-4 text-gray-500">
          Soal {index + 1} / {questions.length}
        </p>

      </div>
    </div>
  );
}

export default QuizBab1;