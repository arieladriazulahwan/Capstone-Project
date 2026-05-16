import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState("");

  const navigate = useNavigate();
  const { dialect, bab } = useParams();

  useEffect(() => {
    fetch(`http://localhost:3000/api/quiz?dialect=${dialect}&bab=${bab}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          setQuestions([]);
        }
      })
      .catch((err) => {
        console.log(err);
        setQuestions([]);
      });
  }, [dialect, bab]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar
          showBackButton
          backTo={`/practice/${dialect}/${bab}`}
        />
        <div className="p-5 text-center">Loading quiz...</div>
      </div>
    );
  }

  const current = questions[index];

  const nextQuestion = async (updatedScore) => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected("");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/api/auth/add-xp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          xp: updatedScore * 10,
        }),
      });

      const result = await res.json();
      console.log("XP RESULT:", result);

      alert(
        `Quiz selesai!\n\n` +
          `Skor: ${updatedScore}/${questions.length}\n` +
          `XP +${updatedScore * 10}`
      );

      if (bab) {
        try {
          await fetch("http://localhost:3000/api/auth/complete-bab", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify({ bab }),
          });
        } catch (err) {
          console.log("Gagal update progress bab:", err);
        }
      }

      navigate("/level");
    } catch (err) {
      console.log("ERROR:", err);
      alert("Gagal menambahkan XP");
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
    const newWord = selected + block;
    setSelected(newWord);

    if (newWord.toLowerCase() === current.answer.toLowerCase()) {
      const updatedScore = score + 1;
      setScore(updatedScore);

      setTimeout(() => {
        nextQuestion(updatedScore);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        showBackButton
        backTo={`/practice/${dialect}/${bab}`}
      />

      <main className="p-5 max-w-xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Quiz Bahasa Kaili</h1>

          <p className="text-gray-500 mt-1">
            Dialek: {dialect.toUpperCase()}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-sm text-gray-500 mb-2">
            Soal {index + 1} / {questions.length}
          </p>

          <h2 className="text-lg font-semibold mb-5">{current.question}</h2>

          {current.options && (
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

          {current.blocks && (
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

              <button
                onClick={() => setSelected("")}
                className="w-full bg-red-500 text-white py-3 rounded-xl mt-4"
              >
                Reset
              </button>
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
