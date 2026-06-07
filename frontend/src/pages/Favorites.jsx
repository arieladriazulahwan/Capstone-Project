import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Skeleton } from "../components/Skeleton";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Favorites() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/api/favorites`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((result) => setData(Array.isArray(result) ? result : []))
      .catch((err) => console.log("Gagal ambil favorit:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="genz-bg flex h-screen overflow-hidden text-sora">
      <Sidebar role="siswa" />

      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
        <Navbar />

        <main className="flex-1 px-4 py-6 flex justify-center">
          <div className="w-full max-w-md md:max-w-3xl">
            <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora mb-5 rounded-3xl p-6">
              <p className="text-xs font-black text-kaili uppercase tracking-wider">Favorit</p>
              <h1 className="text-2xl sm:text-3xl font-black text-sora mb-1">
                Kosakata Favorit
              </h1>
              <p className="mt-1 text-sm font-bold text-sora/60">
                Kumpulan kata yang kamu simpan dari kamus.
              </p>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-3xl" />
                <Skeleton className="h-24 w-full rounded-3xl" />
                <Skeleton className="h-24 w-full rounded-3xl" />
              </div>
            ) : data.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora rounded-3xl p-8 text-center">
                <p className="font-black text-sora text-lg">
                  Belum ada favorit
                </p>
                <p className="mt-1 text-sm font-bold text-sora/60">
                  Simpan kata dari Kamus agar muncul di sini.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-20">
                {data.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/80 backdrop-blur-md border border-sora/10 shadow-soft-sora p-5 rounded-3xl transition-all hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-sora text-lg">
                          {item.indonesia}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.translations?.map((t, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-xl text-sm font-bold bg-kaili/10 text-kaili border border-kaili/20"
                            >
                              {t.word} ({t.dialect})
                            </span>
                          ))}
                        </div>
                      </div>

                      <span className="rounded-xl bg-red-500/10 px-3 py-1.5 text-xs font-black text-red-500 uppercase tracking-wider border border-red-500/20">
                        Favorit
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

export default Favorites;
