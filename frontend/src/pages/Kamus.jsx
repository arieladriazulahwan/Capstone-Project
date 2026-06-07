import { HiSparkles } from "react-icons/hi";
import { useEffect, useState } from "react";
import { FiHeart, FiSearch, FiBookOpen } from "react-icons/fi";


import { SkeletonList } from "../components/Skeleton";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Kamus() {
  const [data, setData] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loadingFav, setLoadingFav] = useState(true);
  const [user, setUser] = useState(null);

  // States untuk Tab "Kamus Kosakata"
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dialect, setDialect] = useState("");
  const [mode, setMode] = useState("indo");

  // States untuk Tab "Terjemahan Kalimat"
  const [activeTab, setActiveTab] = useState("kosakata"); // "kosakata" | "kalimat"
  const [translateSource, setTranslateSource] = useState("indo");
  const [translateTarget, setTranslateTarget] = useState("kaili");
  const [translateDialect, setTranslateDialect] = useState("ledo");
  const [translateText, setTranslateText] = useState("");
  const [translateResult, setTranslateResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // 🔥 GET VOCAB
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/vocab`)
      .then((res) => res.json())
      .then((res) => setData(res));
  }, []);

  // 🙋‍♂️ GET USER
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser({ name: "Pengguna" }); // Set default user if not logged in
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: "Bearer " + token },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data);
        } else {
          setUser({ name: "Pengguna" });
        }
      } catch (error) {
        setUser({ name: "Pengguna" });
      }
    };
    fetchUser();
  }, []);

  // ❤️ GET FAVORITES
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/favorites`, {
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
      await fetch(`${API_BASE_URL}/api/favorites`, {
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
    let result = data;

    // 1. Terapkan filter Kategori dan Dialek terlebih dahulu
    result = result.filter((item) => {
      const matchCategory = category
        ? item.category.toLowerCase() === category.toLowerCase()
        : true;

      const matchDialect = dialect
        ? item.translations.some(
            (t) => t.dialect.toLowerCase() === dialect.toLowerCase()
          )
        : true;

      return matchCategory && matchDialect;
    });

    // 2. Jika tidak ada pencarian kata kunci, langsung kembalikan hasil filter kategori/dialek
    if (!search.trim()) return result;

    const keywords = getSearchTokens(search);

    return result
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
      .sort((a, b) => b.score - a.score);
  })();

  // 🗣️ TRANSLATE SENTENCE
  const handleTranslate = async () => {
    if (!translateText.trim()) return;
    setIsTranslating(true);
    setTranslateResult("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/vocab/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: translateText,
          sourceLang: translateSource,
          targetLang: translateTarget,
          dialect: translateDialect
        })
      });

      const resultData = await res.json();
      if (res.ok) {
        setTranslateResult(resultData.translation);
      } else {
        setTranslateResult(`Error: ${resultData.message}`);
      }
    } catch (err) {
      setTranslateResult("Terjadi kesalahan saat menerjemahkan. Pastikan backend sedang berjalan.");
    } finally {
      setIsTranslating(false);
    }
  };

  const swapTranslateLang = () => {
    const temp = translateSource;
    setTranslateSource(translateTarget);
    setTranslateTarget(temp);
    setTranslateResult("");
  };

  return (
    <div className="flex h-screen overflow-hidden genz-bg text-sora">
      <Sidebar role="siswa" />

      <div className="flex-1 flex flex-col pb-20 md:pb-0">
        <Navbar user={user} />

        <main className="flex-1 px-4 py-6 flex justify-center">
          <div className="w-full max-w-md md:max-w-3xl">

            <div className="bg-kaili/10 border border-kaili/20 mb-5 rounded-3xl p-6 shadow-soft-sora relative overflow-hidden">
              <div className="absolute top-[-50%] right-[-10%] w-32 h-32 bg-kaili/30 rounded-full blur-2xl"></div>
              <p className="text-sm font-black text-kaili tracking-widest uppercase"><span className="inline-flex items-center gap-2">Kamus <FiBookOpen /></span></p>
              <h1 className="text-2xl font-black text-sora mt-1">
                Kamus Bahasa Kaili
              </h1>
              <p className="mt-1 text-sm text-sora/60 font-medium">
                Cari arti kata, terjemahkan kalimat, dan simpan kosakata favoritmu.
              </p>
            </div>

            {/* TABS */}
            <div className="flex bg-white/60 backdrop-blur-xl rounded-2xl shadow-soft-sora mb-5 p-1 border border-white/60">
              <button
                onClick={() => setActiveTab("kosakata")}
                className={`flex-1 py-3 text-sm md:text-base font-black rounded-xl transition-all ${
                  activeTab === "kosakata" ? "bg-sora text-white shadow-soft-sora" : "text-sora/60 hover:bg-white/40 hover:text-sora"
                }`}
              >
                Kosakata Dasar
              </button>
              <button
                onClick={() => setActiveTab("kalimat")}
                className={`flex-1 py-3 text-sm md:text-base font-black rounded-xl transition-all ${
                  activeTab === "kalimat" ? "bg-sora text-white shadow-soft-sora" : "text-sora/60 hover:bg-white/40 hover:text-sora"
                }`}
              >
                Terjemahan Kalimat <HiSparkles size={16} className="inline text-kaili" />
              </button>
            </div>

            {/* KONTEN TAB KALIMAT */}
            {activeTab === "kalimat" && (
              <div className="bg-white/60 backdrop-blur-xl p-5 rounded-3xl shadow-soft-sora border border-white/60 mb-8">
                
                <div className="flex justify-between items-center mb-5 bg-white/50 rounded-2xl p-2 border border-white/60 shadow-sm">
                  <div className="flex-1 text-center font-black text-sora">
                    {translateSource === "indo" ? "Indonesia" : "Kaili"}
                    {translateSource === "kaili" && (
                      <select 
                        value={translateDialect} 
                        onChange={e => setTranslateDialect(e.target.value)}
                        className="block w-full text-center mt-1 text-xs p-1 bg-transparent text-sora/60 font-bold outline-none"
                      >
                        <option value="ledo">Dialek Ledo</option>
                        <option value="rai">Dialek Rai</option>
                      </select>
                    )}
                    {translateSource === "indo" && (
                      <div className="mt-1 text-xs p-1 text-transparent">_</div>
                    )}
                  </div>
                  
                  <button 
                    onClick={swapTranslateLang} 
                    className="mx-2 p-3 bg-white shadow-sm border border-sora/10 rounded-full hover:bg-cream hover:scale-105 transition-all text-kaili btn-bouncy"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 21h5v-5M21 3l-7 7M3 21l7-7"/></svg>
                  </button>
                  
                  <div className="flex-1 text-center font-black text-sora">
                    {translateTarget === "indo" ? "Indonesia" : "Kaili"}
                    {translateTarget === "kaili" && (
                      <select 
                        value={translateDialect} 
                        onChange={e => setTranslateDialect(e.target.value)}
                        className="block w-full text-center mt-1 text-xs p-1 bg-transparent text-sora/60 font-bold outline-none"
                      >
                        <option value="ledo">Dialek Ledo</option>
                        <option value="rai">Dialek Rai</option>
                      </select>
                    )}
                    {translateTarget === "indo" && (
                      <div className="mt-1 text-xs p-1 text-transparent">_</div>
                    )}
                  </div>
                </div>
                
                <textarea
                  className="w-full p-4 rounded-2xl bg-white/50 border border-white/60 mb-4 focus:ring-2 focus:ring-sora focus:outline-none resize-none text-sora font-medium placeholder-sora/40 transition-all"
                  rows="4"
                  placeholder={translateSource === "indo" ? "Ketik kalimat bahasa Indonesia di sini..." : "Ketik kalimat bahasa Kaili di sini..."}
                  value={translateText}
                  onChange={e => setTranslateText(e.target.value)}
                ></textarea>
                
                <button
                  onClick={handleTranslate}
                  disabled={isTranslating || !translateText.trim()}
                  className="w-full bg-kaili text-white font-black py-4 rounded-2xl shadow-glow-kaili hover:scale-[1.02] transition-all disabled:opacity-50 flex justify-center items-center gap-2 btn-bouncy"
                >
                  {isTranslating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Menerjemahkan...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
                      Terjemahkan
                    </>
                  )}
                </button>
                
                {translateResult && (
                  <div className="mt-5 p-5 bg-kaili/10 border border-kaili/20 rounded-2xl shadow-soft-sora relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-kaili/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-kaili flex items-center justify-center text-white"><HiSparkles size={16} /></div>
                      <p className="text-sm text-kaili font-black">Hasil Terjemahan:</p>
                    </div>
                    <p className="text-sora text-lg whitespace-pre-wrap ml-10 leading-relaxed font-black relative z-10">{translateResult}</p>
                  </div>
                )}
              </div>
            )}

            {/* KONTEN TAB KOSAKATA */}
            {activeTab === "kosakata" && (
              <>
                {/* MODE */}
                <div className="flex gap-2 mb-3 rounded-2xl p-1 bg-white/60 backdrop-blur-md shadow-sm border border-white/60">
                  <button
                    onClick={() => setMode("indo")}
                    className={`flex-1 px-4 py-2 rounded-xl font-black transition-all ${
                      mode === "indo"
                        ? "bg-sora text-white shadow-soft-sora"
                        : "bg-white/50 text-sora/60 hover:text-sora"
                    }`}
                  >
                    Indo → Kaili
                  </button>

                  <button
                    onClick={() => setMode("kaili")}
                    className={`flex-1 px-4 py-2 rounded-xl font-black transition-all ${
                      mode === "kaili"
                        ? "bg-sora text-white shadow-soft-sora"
                        : "bg-white/50 text-sora/60 hover:text-sora"
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
                      ? "Cari kata Indonesia..."
                      : "Cari kata Kaili..."
                  }
                  className="w-full p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 mb-3 focus:outline-none focus:ring-2 focus:ring-sora text-sora font-medium placeholder-sora/40 transition-all shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {/* FILTER */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <select
                    className="flex-1 min-w-[140px] p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 text-sora font-bold outline-none focus:ring-2 focus:ring-sora shadow-sm"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Semua Kategori</option>
                    <option value="kata benda">Kata Benda</option>
                    <option value="kata kerja">Kata Kerja</option>
                    <option value="kata sifat">Kata Sifat</option>
                    <option value="kata keterangan">Kata Keterangan</option>
                    <option value="kata ganti">Kata Ganti</option>
                    <option value="kata depan">Kata Depan</option>
                    <option value="kata sambung">Kata Sambung</option>
                    <option value="kata bilangan">Kata Bilangan</option>
                    <option value="kata seru">Kata Seru</option>
                    <option value="kata sandang">Kata Sandang</option>
                  </select>

                  <select
                    className="flex-1 min-w-[140px] p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 text-sora font-bold outline-none focus:ring-2 focus:ring-sora shadow-sm"
                    onChange={(e) => setDialect(e.target.value)}
                  >
                    <option value="">Semua Dialek</option>
                    <option value="ledo">Ledo</option>
                    <option value="rai">Rai</option>
                  </select>
                </div>

                {/* LOADING */}
                 {loadingFav ? (
                  <SkeletonList count={5} />
                ) : (
                  <div className="flex flex-col gap-3 mb-8">
                    {filtered.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl shadow-soft-sora border border-white/60 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-black text-xl text-sora">
                            {mode === "indo"
                              ? item.indonesia
                              : item.translations.map((t) => t.word).join(", ")}
                          </h3>

                          <button
                            onClick={() => toggleFavorite(item.id)}
                            className="text-xl hover:scale-125 transition active:scale-95"
                          >
                            {favorites.has(item.id) ? <FiHeart size={20} className="text-red-500 drop-shadow-md" fill="currentColor" /> : <FiHeart size={20} className="text-sora/40 hover:text-red-400" />}
                          </button>
                        </div>

                        <p className="text-[10px] font-black text-sora/40 uppercase tracking-widest mb-3">
                          {item.category}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {mode === "indo" ? (
                            item.translations.map((t, i) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 rounded-full text-xs bg-kaili/10 text-kaili border border-kaili/20 font-black shadow-sm"
                              >
                                <span className="opacity-70 mr-1">{t.dialect}:</span> {t.word}
                              </span>
                            ))
                          ) : (
                            <span className="px-3 py-1.5 rounded-full text-xs bg-sora text-white font-black shadow-soft-sora">
                              {item.indonesia}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {filtered.length === 0 && (
                      <div className="text-center bg-white/50 backdrop-blur-md p-8 rounded-3xl border-2 border-dashed border-white/60 shadow-sm">
                        <div className="text-4xl mb-2 flex justify-center"><FiSearch size={40} className="text-sora/40" /></div>
                        <h3 className="font-black text-sora mb-1">Kata tidak ditemukan</h3>
                        <p className="text-sm text-sora/60 font-medium">
                          Kosakata yang Anda cari mungkin belum tersedia.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

export default Kamus;
