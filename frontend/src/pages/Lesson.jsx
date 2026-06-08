import { FaRocket, FaFrown } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { filterByLevel, getBab, getLevel } from "../data/levelMap";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Lesson() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { dialect, bab, level } = useParams();
  const babInfo = getBab(bab);
  const levelInfo = getLevel(bab, level);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/lesson/${dialect}/${bab}`)
      .then((res) => res.json())
      .then((res) => {
        const items = Array.isArray(res) ? filterByLevel(res, bab, level) : [];
        const filtered = items.map((item) => ({
          indo: item.indo || item.indonesia || item.question || "-",
          kaili: item.kaili || item.answer || "-",
          tipe: item.category || item.tipe || levelInfo?.title || "materi",
          image: item.image || item.gambar || "",
        }));

        setData(filtered);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bab, dialect, level, levelInfo?.title]);

  return (
    <div className="h-screen overflow-hidden genz-bg text-sora flex flex-col">
      <Navbar
        showBackButton
        backTo={level ? `/level/${dialect}/${bab}` : "/level"}
      />

      <main className="p-4 max-w-xl mx-auto overflow-y-auto overflow-x-hidden flex-1">
        <div className="bg-sora text-cream rounded-3xl p-6 mb-5 shadow-soft-sora relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-kaili/20 rounded-full blur-2xl"></div>
          <p className="text-sm font-black text-cream/80">
            Materi {dialect.toUpperCase()}
          </p>
          <h1 className="text-2xl font-black text-cream mt-1">
            {levelInfo?.title || babInfo?.title || bab.toUpperCase()}
          </h1>
          <p className="mt-2 text-sm text-cream/60 font-medium">
            Pelajari kata dan arti sebelum masuk latihan.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-10 h-10 border-4 border-kaili/20 border-t-kaili rounded-full animate-spin"></div>
            <p className="text-sora/60 font-medium animate-pulse">Memuat materi...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 font-bold text-center">
            <span className="inline-flex items-center gap-2">Materi belum tersedia <FaFrown className="text-red-400" /></span>
          </div>
        ) : (
          data.map((item, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-xl p-5 rounded-3xl shadow-soft-sora mb-4 border border-white/60 hover:shadow-md transition-all">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.indo}
                  className="w-full h-48 object-contain rounded-2xl bg-cream mb-4"
                />
              )}

              <div className="flex justify-between items-center mb-1">
                <p className="font-bold text-sora/60">{item.indo}</p>

                <span className="text-[10px] bg-kaili/10 text-kaili px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {item.tipe}
                </span>
              </div>

              <p className="text-2xl font-black text-sora">
                {item.kaili}
              </p>
            </div>
          ))
        )}

        {!loading && data.length > 0 && <div className="h-24" />}
      </main>

      {!loading && data.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:w-full md:max-w-xl md:-translate-x-1/2 z-40 bg-white/60 backdrop-blur-xl border border-white/60 shadow-soft-sora px-3 py-3 rounded-full flex justify-center">
          <button
            onClick={() =>
              navigate(
                level
                  ? `/practice/${dialect}/${bab}/${level}`
                  : `/practice/${dialect}/${bab}`
              )
            }
            className="w-full bg-sora text-cream px-6 py-4 rounded-full font-black text-lg shadow-soft-sora btn-bouncy"
          >
            <span className="inline-flex items-center justify-center gap-2">Mulai Latihan <FaRocket /></span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Lesson;
