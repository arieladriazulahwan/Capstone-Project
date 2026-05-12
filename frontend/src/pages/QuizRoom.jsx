import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function QuizRoom() {

  const { code } = useParams();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] = useState({});

  // =====================================
  // FETCH ROOM
  // =====================================
  useEffect(() => {

    const fetchRoom = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:3000/api/rooms/join/${code}`,
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

        setRoom(data.room);

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
  // JAWABAN
  // =====================================
  const saveAnswer = (value) => {

    setAnswers({
      ...answers,
      [currentQuestion]: value,
    });

  };

  // =====================================
  // NEXT
  // =====================================
  const nextQuestion = () => {

    if (
      currentQuestion <
      room.questions.length - 1
    ) {

      setCurrentQuestion(
        currentQuestion + 1
      );

    }

  };

  // =====================================
  // PREV
  // =====================================
  const prevQuestion = () => {

    if (currentQuestion > 0) {

      setCurrentQuestion(
        currentQuestion - 1
      );

    }

  };

  // =====================================
  // SUBMIT
  // =====================================
  const submitQuiz = () => {

    console.log("Jawaban:", answers);

    alert("Jawaban berhasil dikirim!");

  };

  // =====================================
  // LOADING
  // =====================================
  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading room...
      </div>
    );

  }

  if (!room) return null;

  const question =
    room.questions[currentQuestion];

  return (

    <div className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl p-5 shadow mb-5">

          <div className="flex justify-between items-center">

            <div>

              <h1 className="text-2xl font-bold">
                🎯 {room.title}
              </h1>

              <p className="text-gray-500">
                Room: {code}
              </p>

            </div>

            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl font-bold">
              Soal {currentQuestion + 1}/
              {room.questions.length}
            </div>

          </div>

        </div>

        {/* CARD SOAL */}
        <div className="bg-white rounded-3xl p-6 shadow">

          {/* PERTANYAAN */}
          <h2 className="text-2xl font-bold mb-6">
            {question.question}
          </h2>

          {/* ================================= */}
          {/* SOAL GAMBAR */}
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
          {(question.answerType ===
            "pilihan" ||
            question.type === "multiple") && (

            <div className="space-y-3">

              {question.options.map(
                (opt, index) => (

                  <button
                    key={index}
                    onClick={() =>
                      saveAnswer(opt)
                    }
                    className={`w-full text-left p-4 rounded-2xl border transition ${
                      answers[currentQuestion] ===
                      opt
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>

                )
              )}

            </div>

          )}

          {/* ================================= */}
          {/* JAWABAN KETIK */}
          {/* ================================= */}
          {question.answerType ===
            "ketik" && (

            <input
              type="text"
              placeholder="Ketik jawaban..."
              value={
                answers[currentQuestion] || ""
              }
              onChange={(e) =>
                saveAnswer(e.target.value)
              }
              className="w-full border p-4 rounded-2xl"
            />

          )}

          {/* ================================= */}
          {/* BLOK KATA */}
          {/* ================================= */}
          {question.answerType ===
            "blok" && (

            <div className="space-y-4">

              <div className="flex flex-wrap gap-3">

                {question.blocks.map(
                  (block, index) => (

                    <button
                      key={index}
                      onClick={() => {

                        const current =
                          answers[
                            currentQuestion
                          ] || [];

                        if (
                          current.includes(block)
                        ) {

                          saveAnswer(
                            current.filter(
                              (b) =>
                                b !== block
                            )
                          );

                        } else {

                          saveAnswer([
                            ...current,
                            block,
                          ]);

                        }

                      }}
                      className={`px-4 py-3 rounded-2xl border ${
                        (
                          answers[
                            currentQuestion
                          ] || []
                        ).includes(block)
                          ? "bg-green-500 text-white"
                          : "bg-white"
                      }`}
                    >
                      {block}
                    </button>

                  )
                )}

              </div>

              <div className="bg-green-50 p-4 rounded-2xl">

                <p className="font-semibold mb-2">
                  Jawaban:
                </p>

                <p className="text-green-700">
                  {(
                    answers[currentQuestion] ||
                    []
                  ).join(" ")}
                </p>

              </div>

            </div>

          )}

          {/* NAVIGATION */}
          <div className="flex justify-between mt-8">

            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="bg-gray-200 px-5 py-3 rounded-2xl disabled:opacity-50"
            >
              ← Sebelumnya
            </button>

            {currentQuestion ===
            room.questions.length - 1 ? (

              <button
                onClick={submitQuiz}
                className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold"
              >
                🚀 Submit Quiz
              </button>

            ) : (

              <button
                onClick={nextQuestion}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold"
              >
                Selanjutnya →
              </button>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}

export default QuizRoom;