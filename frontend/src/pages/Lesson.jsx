import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function Lesson() {
  const [data, setData] = useState([]);

  const navigate = useNavigate();
  const { dialect, bab } = useParams();

  useEffect(() => {
    fetch(`http://localhost:3000/api/lesson/${dialect}/${bab}`)
      .then((res) => res.json())
      .then((res) => {
        const filtered = res.map((item) => ({
          indo: item.indo,
          kaili: item.kaili,
          tipe: item.tipe,
        }));

        setData(filtered);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [bab, dialect]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        showBackButton
        backTo="/level"
      />

      <main className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-5">
          Materi {bab.toUpperCase()} ({dialect.toUpperCase()})
        </h1>

        {data.length === 0 && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl">
            Materi belum tersedia
          </div>
        )}

        {data.map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow mb-3">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-700">{item.indo}</p>

              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                {item.tipe}
              </span>
            </div>

            <p className="text-2xl font-bold text-green-600 mt-2">
              {item.kaili}
            </p>
          </div>
        ))}

        {data.length > 0 && (
          <button
            onClick={() => navigate(`/practice/${dialect}/${bab}`)}
            className="w-full mt-6 bg-green-500 text-white p-3 rounded-xl"
          >
            Lanjut ke Latihan
          </button>
        )}
      </main>
    </div>
  );
}

export default Lesson;
