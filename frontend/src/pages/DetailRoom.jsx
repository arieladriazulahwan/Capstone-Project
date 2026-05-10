import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import NavbarGuru from "../components/NavbarGuru";

function DetailRoom() {

  const { id } = useParams();

  const [room, setRoom] = useState(null);

  useEffect(() => {

    const fetchRoom = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:3000/api/rooms/detail/${id}`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await res.json();

        setRoom(data);

      } catch (err) {

        console.log(err);

      }

    };

    fetchRoom();

  }, [id]);

  if (!room) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-lg font-semibold">
          Loading...
        </div>
      </div>
    );

  }

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <Sidebar role="guru" />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* NAVBAR */}
        

        {/* CONTENT */}
        <main className="flex-1 p-4 md:p-6 flex justify-center">

          <div className="w-full max-w-5xl">

            {/* ROOM HEADER */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-3xl p-6 text-white shadow-lg mb-6">

              <div className="flex justify-between items-start">

                <div>

                  <h1 className="text-3xl font-bold mb-2">
                    {room.title}
                  </h1>

                  <p className="text-blue-100">
                    {room.category}
                  </p>

                </div>

                <div className="bg-white/20 px-5 py-3 rounded-2xl text-xl font-bold backdrop-blur-sm">
                  {room.room_code}
                </div>

              </div>

              <div className="flex flex-wrap gap-4 mt-6 text-sm">

                <div className="bg-white/10 px-4 py-2 rounded-xl">
                  ⏱️ {room.timer} detik
                </div>

                <div className="bg-white/10 px-4 py-2 rounded-xl">
                  📚 {room.questions?.length || 0} soal
                </div>

                <div className="bg-white/10 px-4 py-2 rounded-xl capitalize">
                  🎯 {room.quiz_type}
                </div>

              </div>

            </div>

            {/* QUESTIONS */}
            <div className="space-y-5">

              {room.questions?.map((q, index) => (

                <div
                  key={q.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >

                  {/* HEADER */}
                  <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">

                    <div>

                      <h2 className="font-bold text-gray-800 text-lg">
                        Soal {index + 1}
                      </h2>

                      <p className="text-sm text-gray-400 mt-1">
                        Tipe soal pembelajaran
                      </p>

                    </div>

                    <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-2xl text-sm font-semibold capitalize">
                      {q.question_type}
                    </div>

                  </div>

                  {/* CONTENT */}
                  <div className="p-5">

                    {/* QUESTION */}
<div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">

  <p className="text-sm text-blue-500 font-semibold mb-2">
    Pertanyaan
  </p>

  <p className="text-gray-800 text-lg font-medium leading-relaxed">
    {q.question}
  </p>

</div>

{/* MULTIPLE CHOICE */}
{q.question_type === "multiple" && (

  <div className="space-y-3">

    <p className="text-sm font-semibold text-gray-500">
      Pilihan Jawaban
    </p>

    {q.options?.map((opt) => (

      <div
        key={opt.id}
        className={`rounded-2xl border px-4 py-3 flex items-center justify-between ${
          opt.is_correct
            ? "bg-green-50 border-green-300"
            : "bg-gray-50 border-gray-200"
        }`}
      >

        <span className="font-medium text-gray-700">
          {opt.option_text}
        </span>

        {opt.is_correct && (
          <span className="text-green-600 font-bold">
            ✓ Benar
          </span>
        )}

      </div>

    ))}

  </div>

)}

{/* ARRANGE BLOCK */}
{q.question_type === "arrange" && (

  <div>

    <p className="text-sm font-semibold text-gray-500 mb-3">
      Susun Kata
    </p>

    <div className="flex flex-wrap gap-2 mb-4">

      {q.options?.map((opt) => (

        <div
          key={opt.id}
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-semibold"
        >
          {opt.option_text}
        </div>

      ))}

    </div>

    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">

      <p className="text-sm text-green-600 mb-1">
        Susunan Benar
      </p>

      <p className="font-bold text-green-700">
        {q.correct_answer}
      </p>

    </div>

  </div>

)}

{/* IMAGE QUESTION */}
{q.question_type === "image" && (

  <div>

    {q.image_url && (

      <img
        src={q.image_url}
        alt="question"
        className="w-full h-52 object-cover rounded-2xl mb-4"
      />

    )}

    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">

      <p className="text-sm text-green-600 mb-1">
        Jawaban Gambar
      </p>

      <p className="font-bold text-green-700">
        {q.correct_answer}
      </p>

    </div>

  </div>

)}

{/* FILL BLANK */}
{q.question_type === "fill" && (

  <div>

    <p className="text-sm font-semibold text-gray-500 mb-3">
      Pilihan Kata
    </p>

    <div className="flex flex-wrap gap-2 mb-4">

      {q.options?.map((opt) => (

        <div
          key={opt.id}
          className={`px-4 py-2 rounded-xl font-semibold ${
            opt.is_correct
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {opt.option_text}
        </div>

      ))}

    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">

      <p className="text-sm text-yellow-600 mb-1">
        Jawaban Benar
      </p>

      <p className="font-bold text-yellow-700">
        {q.correct_answer}
      </p>

    </div>

  </div>

)}

                    {/* ANSWER */}
                    <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">

                      <p className="text-sm text-gray-500 mb-1">
                        Jawaban Benar
                      </p>

                      <p className="font-bold text-yellow-700 text-lg">
                        {q.correct_answer}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </main>

      </div>

      {/* MOBILE NAV */}
      <BottomNav role="guru" />

    </div>

  );

}

export default DetailRoom;