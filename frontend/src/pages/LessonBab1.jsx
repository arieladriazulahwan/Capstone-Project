import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function LessonBab1() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const { dialect } = useParams();

  useEffect(() => {
    fetch(`http://localhost:3000/api/lesson/${dialect}/bab1`)
      .then((res) => res.json())
      .then(setData);
  }, [dialect]);

  return (
    <div className="p-4">
      <h1 className="font-bold mb-4">
        📖 Belajar Dialek {dialect.toUpperCase()}
      </h1>

      {data.map((item, i) => (
        <div
          key={i}
          className="bg-white p-3 rounded-lg shadow mb-2"
        >
          <p className="font-semibold">{item.indo}</p>
          <p className="text-green-600">{item.kaili}</p>
        </div>
      ))}

      <button
        onClick={() =>
          navigate(`/practice/${dialect}/bab1`)
        }
        className="mt-4 bg-green-500 text-white p-3 rounded-xl w-full"
      >
        Lanjut ke Latihan 🚀
      </button>
    </div>
  );
}

export default LessonBab1;