import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";

function Kamus() {
  const [data, setData] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loadingFav, setLoadingFav] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dialect, setDialect] = useState("");
  const [mode, setMode] = useState("indo");

  // 🔥 GET VOCAB
  useEffect(() => {
    fetch("http://localhost:3000/api/vocab")
      .then((res) => res.json())
      .then((res) => setData(res));
  }, []);

  // ❤️ GET FAVORITES
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:3000/api/favorites", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const result = await res.json();

        const favIds = Array.isArray(result)
          ? result.map((item) => item.vocab_id)
          : [];

        setFavorites(new Set(favIds));
      } catch (err) {
        console.log("Error ambil favorit:", err);
      } finally {
        setLoadingFav(false);
      }
    };

    fetchFavorites();
  }, []);

  // ❤️ TOGGLE FAVORIT
  const toggleFavorite = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login dulu!");

    const isFav = favorites.has(id);

    try {
      await fetch("http://localhost:3000/api/favorites", {
        method: isFav ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ vocabId: id }),
      });

      setFavorites((prev) => {
        const newSet = new Set(prev);
        if (isFav) newSet.delete(id);
        else newSet.add(id);
        return newSet;
      });
    } catch (err) {
      console.log("Error toggle:", err);
    }
  };

  const getSearchTokens = (text = "") =>
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  // 🔍 SEARCH + FILTER (SMART)
  const filtered = (() => {
  if (!search.trim()) return data;

  const keywords = getSearchTokens(search);

  return data
    .map((item) => {
      let score = 0;

      // 🔥 pecah semua kata indonesia
      const indoTokens = getSearchTokens(item.indonesia);

      // 🔥 pecah semua kata kaili
      const kailiTokens = item.translations.flatMap((t) =>
        getSearchTokens(t.word)
      );

      // 🔥 MODE INDONESIA
      if (mode === "indo") {
        score = keywords.filter((k) =>
          indoTokens.includes(k)
        ).length;
      }

      // 🔥 MODE KAILI
      if (mode === "kaili") {
        score = keywords.filter((k) =>
          kailiTokens.includes(k)
        ).length;
      }

      return { ...item, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter((item) => {
      const matchCategory = category
        ? item.category.toLowerCase() === category.toLowerCase()
        : true;

      const matchDialect = dialect
        ? item.translations.some(
            (t) =>
              t.dialect.toLowerCase() === dialect.toLowerCase()
          )
        : true;

      return matchCategory && matchDialect;
    });
})();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="siswa" />

      <div className="flex-1 flex flex-col">
        <Navbar user={{ name: "User" }} />

        <main className="flex-1 px-4 py-6 flex justify-center">
          <div className="w-full max-w-md md:max-w-3xl">

            <h1 className="text-2xl font-bold text-green-600 mb-4">
              📚 Kamus Bahasa Kaili
            </h1>

            {/* MODE */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setMode("indo")}
                className={`px-4 py-2 rounded-xl ${
                  mode === "indo"
                    ? "bg-green-500 text-white"
                    : "bg-white border"
                }`}
              >
                Indo → Kaili
              </button>

              <button
                onClick={() => setMode("kaili")}
                className={`px-4 py-2 rounded-xl ${
                  mode === "kaili"
                    ? "bg-green-500 text-white"
                    : "bg-white border"
                }`}
              >
                Kaili → Indo
              </button>
            </div>

            {/* SEARCH */}
            <input
              type="text"
              placeholder={
                mode === "indo"
                  ? "Cari Indonesia..."
                  : "Cari Kaili..."
              }
              className="w-full p-3 rounded-xl border mb-3"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* FILTER */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <select
                className="p-2 rounded-lg border"
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                <option value="kata benda">Kata Benda</option>
                <option value="kata kerja">Kata Kerja</option>
                <option value="kata sifat">Kata Sifat</option>
                <option value="kata ganti">Kata Ganti</option>
              </select>

              <select
                className="p-2 rounded-lg border"
                onChange={(e) => setDialect(e.target.value)}
              >
                <option value="">Semua Dialek</option>
                <option value="ledo">Ledo</option>
                <option value="rai">Rai</option>
              </select>
            </div>

            {/* LOADING */}
            {loadingFav ? (
              <p className="text-center text-gray-500">
                Memuat favorit...
              </p>
            ) : (
              <div className="flex flex-col gap-3 mb-20">

                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-xl shadow"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg">
                        {mode === "indo"
                          ? item.indonesia
                          : item.translations.map((t) => t.word).join(", ")}
                      </h3>

                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="text-xl hover:scale-125 transition"
                      >
                        {favorites.has(item.id) ? "❤️" : "🤍"}
                      </button>
                    </div>

                    <p className="text-sm text-gray-500 mb-2">
                      {item.category}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {mode === "indo" ? (
                        item.translations.map((t, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700"
                          >
                            {`${t.dialect}: ${t.word}`}
                          </span>
                        ))
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm bg-green-500 text-white">
                          {item.indonesia}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {filtered.length === 0 && (
                  <p className="text-center text-gray-500">
                    Tidak ditemukan 😢
                  </p>
                )}

              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNav role="siswa" />
    </div>
  );
}

export default Kamus;
