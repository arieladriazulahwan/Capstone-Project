import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function QuizPage() {

  const { code } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);

  const [selected, setSelected] = useState("");
  const [arrangeAnswer, setArrangeAnswer] = useState([]);

  const [score, setScore] = useState(0);

  useEffect(() => {

    fetchQuiz();

  }, []);

  const fetchQuiz = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3000/api/rooms/${code}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();

      setRoom(data.room);
      setQuestions(data.questions || []);

    } catch (err) {

      console.log(err);

    }

  };

  const question = questions[current];

  const nextQuestion = () => {

    let correct = false;

    // MULTIPLE CHOICE
    if (question.question_type === "multiple") {

      correct = selected === question.correct_answer;

    }

    // ARRANGE
    if (question.question_type === "arrange") {

      correct =
        arrangeAnswer.join(" ") ===
        question.correct_answer;

    }

    // FILL
    if (question.question_type === "fill") {

      correct = selected === question.correct_answer;

    }

    // IMAGE
    if (question.question_type === "image") {

      correct = selected === question.correct_answer;

    }

    if (correct) {

      setScore(score + 10);

    }

    setSelected("");
    setArrangeAnswer([]);

    if (current + 1 < questions.length) {

      setCurrent(current + 1);

    } else {

      finishQuiz();

    }

  };

  const finishQuiz = async () => {

    try {

      const token = localStorage.getItem("token");

      await fetch(
        `http://localhost:3000/api/rooms/quiz/${code}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            xp: score,
          }),
        }
      );

      alert(`Quiz selesai! Score kamu ${score}`);

      navigate("/dashboard");

    } catch (err) {

      console.log(err);

    }

  };

  if (!room || questions.length === 0) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Quiz...
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-500 p-5 flex justify-center">

      <div className="w-full max-w-2xl">

        {/* HEADER */}
        <div className="bg-white rounded-3xl p-5 shadow mb-5">

          <div className="flex justify-between items-center">

            <div>
              <h1 className="text-2xl font-bold">
                {room.title}
              </h1>

              <p className="text-gray-500">
                Soal {current + 1} / {questions.length}
              </p>
            </div>

            <div className="bg-green-100 text-green-600 px-4 py-2 rounded-2xl font-bold">
              ⭐ {score}
            </div>

          </div>
        </div>

        {/* QUESTION */}
        <div className="bg-white rounded-3xl p-6 shadow">

          <div className="mb-4">

            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
              {question.question_type}
            </span>

          </div>

          <h2 className="text-2xl font-bold mb-6">

            {question.question}

          </h2>

          {/* MULTIPLE */}
          {question.question_type === "multiple" && (

            <div className="flex flex-col gap-3">

              {question.options?.map((opt, i) => (

                <button
                  key={i}
                  onClick={() => setSelected(opt.option_text)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    selected === opt.option_text
                      ? "bg-green-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {opt.option_text}
                </button>

              ))}

            </div>

          )}

          {/* FILL */}
          {question.question_type === "fill" && (

            <div className="flex flex-wrap gap-3">

              {question.options?.map((opt, i) => (

                <button
                  key={i}
                  onClick={() => setSelected(opt.option_text)}
                  className={`px-5 py-3 rounded-2xl ${
                    selected === opt.option_text
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {opt.option_text}
                </button>

              ))}

            </div>

          )}

          {/* ARRANGE */}
          {question.question_type === "arrange" && (

            <div>

              <div className="bg-gray-100 min-h-[70px] rounded-2xl p-3 flex flex-wrap gap-2 mb-5">

                {arrangeAnswer.map((word, i) => (

                  <div
                    key={i}
                    className="bg-green-500 text-white px-4 py-2 rounded-xl"
                  >
                    {word}
                  </div>

                ))}

              </div>

              <div className="flex flex-wrap gap-2">

                {question.options?.map((opt, i) => (

                  <button
                    key={i}
                    onClick={() =>
                      setArrangeAnswer([
                        ...arrangeAnswer,
                        opt.option_text,
                      ])
                    }
                    className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl"
                  >
                    {opt.option_text}
                  </button>

                ))}

              </div>

            </div>

          )}

          {/* IMAGE */}
          {question.question_type === "image" && (

            <div>

              {question.image && (

                <img
                  src={question.image}
                  alt=""
                  className="w-48 rounded-2xl mb-5"
                />

              )}

              <div className="flex flex-col gap-3">

                {question.options?.map((opt, i) => (

                  <button
                    key={i}
                    onClick={() => setSelected(opt.option_text)}
                    className={`p-4 rounded-2xl ${
                      selected === opt.option_text
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {opt.option_text}
                  </button>

                ))}

              </div>

            </div>

          )}

          {/* BUTTON */}
          <button
            onClick={nextQuestion}
            className="w-full bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl font-bold mt-8"
          >
            Lanjut 🚀
          </button>

        </div>
      </div>
    </div>
  );
}

export default QuizPage;