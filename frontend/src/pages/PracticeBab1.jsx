import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PracticeBab1() {
  const [data, setData] = useState([]);
  const [selectedIndo, setSelectedIndo] = useState(null);
  const [selectedKaili, setSelectedKaili] = useState(null);
  const [matched, setMatched] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/lesson/bab1")
      .then(res => res.json())
      .then(setData);
  }, []);

  // shuffle kaili biar random
  const shuffled = [...data].sort(() => Math.random() - 0.5);

  const handleMatch = () => {
    if (!selectedIndo || !selectedKaili) return;

    if (selectedIndo.kaili === selectedKaili.kaili) {
      setMatched([...matched, selectedIndo.kaili]);
    }

    setSelectedIndo(null);
    setSelectedKaili(null);
  };

  useEffect(() => {
    handleMatch();
  }, [selectedKaili]);

  return (
    <div className="p-4">
      <h1 className="font-bold mb-4">🧠 Latihan Cocokkan Kata</h1>

      <div className="grid grid-cols-2 gap-4">

        {/* Indonesia */}
        <div>
          {data.map((item, i) => (
            <div
              key={i}
              onClick={() => setSelectedIndo(item)}
              className={`p-3 mb-2 rounded cursor-pointer border ${
                matched.includes(item.kaili)
                  ? "bg-green-200"
                  : "bg-white"
              }`}
            >
              {item.indo}
            </div>
          ))}
        </div>

        {/* Kaili */}
        <div>
          {shuffled.map((item, i) => (
            <div
              key={i}
              onClick={() => setSelectedKaili(item)}
              className={`p-3 mb-2 rounded cursor-pointer border ${
                matched.includes(item.kaili)
                  ? "bg-green-200"
                  : "bg-white"
              }`}
            >
              {item.kaili}
            </div>
          ))}
        </div>

      </div>

      {/* PROGRESS */}
      <p className="mt-4 text-sm">
        Progress: {matched.length} / {data.length}
      </p>

      {/* NEXT */}
      {matched.length === data.length && (
        <button
          onClick={() => navigate("/quiz/bab1")}
          className="mt-4 w-full bg-green-500 text-white p-3 rounded-xl"
        >
          Lanjut ke Quiz 🚀
        </button>
      )}
    </div>
  );
}

export default PracticeBab1;