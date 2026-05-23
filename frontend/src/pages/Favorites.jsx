import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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
    <div className="student-page-bg flex min-h-screen bg-gray-100">
      <Sidebar role="siswa" />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 px-4 py-6 flex justify-center">
          <div className="w-full max-w-md md:max-w-3xl">
            <div className="student-hero-card mb-5 rounded-3xl p-5 shadow">
              <p className="text-sm font-semibold text-green-700">Favorit</p>
              <h1 className="text-2xl font-bold text-gray-900">
                Kosakata Favorit
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Kumpulan kata yang kamu simpan dari kamus.
              </p>
            </div>

            {loading ? (
              <div className="student-glass-card rounded-2xl p-5 text-center text-gray-500">
                Memuat favorit...
              </div>
            ) : data.length === 0 ? (
              <div className="student-glass-card rounded-2xl p-6 text-center">
                <p className="font-semibold text-gray-700">
                  Belum ada favorit
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Simpan kata dari Kamus agar muncul di sini.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-20">
                {data.map((item) => (
                  <div
                    key={item.id}
                    className="student-list-card bg-white p-4 rounded-xl shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.indonesia}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.translations?.map((t, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700"
                            >
                              {t.word} ({t.dialect})
                            </span>
                          ))}
                        </div>
                      </div>

                      <span className="rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-500">
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

      <BottomNav role="siswa" />
    </div>
  );
}

export default Favorites;
