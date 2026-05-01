import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* ================= HERO ================= */}
      <div className="flex justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 text-center">

          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center text-2xl text-white shadow-md">
              🌿
            </div>
          </div>

          <h1 className="text-2xl font-bold text-green-600">
            Sora Kaili
          </h1>

          <p className="text-gray-500 mt-2 mb-6 text-sm">
            Belajar Bahasa Kaili dengan Seru!
          </p>

          <p className="mb-3 font-medium">Masuk sebagai:</p>

          <div className="flex gap-3 mb-4">
            <div
              onClick={() => navigate("/login/siswa")}
              className="flex-1 p-3 rounded-xl border cursor-pointer hover:bg-green-100 transition"
            >
              👨‍🎓 Siswa
            </div>

            <div
              onClick={() => navigate("/login/guru")}
              className="flex-1 p-3 rounded-xl border cursor-pointer hover:bg-blue-100 transition"
            >
              👨‍🏫 Guru
            </div>
          </div>

          <p className="text-sm">
            Belum punya akun?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-green-600 cursor-pointer"
            >
              Daftar di sini
            </span>
          </p>
        </div>
      </div>

      {/* ================= ABOUT ================= */}
      <div className="bg-white py-12 px-6 text-center">
        <h2 className="text-xl font-bold mb-3">
          Tentang Kami
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Sora Kaili adalah platform pembelajaran digital untuk melestarikan
          Bahasa Kaili melalui metode interaktif seperti latihan,
          permainan, dan kuis. Kami ingin generasi muda tetap mengenal
          dan menggunakan bahasa daerahnya dengan cara yang menyenangkan.
        </p>
      </div>

      {/* ================= FITUR ================= */}
      <div className="py-12 px-6">
        <h2 className="text-center text-xl font-bold mb-8">
          Fitur Unggulan
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">

          <div className="bg-white p-5 rounded-xl shadow text-center">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-semibold mb-1">Kamus Interaktif</h3>
            <p className="text-sm text-gray-500">
              Belajar kosakata Bahasa Kaili dengan mudah
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow text-center">
            <div className="text-3xl mb-2">🎮</div>
            <h3 className="font-semibold mb-1">Game Edukasi</h3>
            <p className="text-sm text-gray-500">
              Belajar sambil bermain dengan mini games seru
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-semibold mb-1">Gamifikasi</h3>
            <p className="text-sm text-gray-500">
              Kumpulkan poin & naik level untuk motivasi belajar
            </p>
          </div>

        </div>
      </div>

      {/* ================= CARA KERJA ================= */}
      <div className="bg-white py-12 px-6">
        <h2 className="text-center text-xl font-bold mb-8">
          Cara Kerja
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto text-center">

          <div>
            <div className="text-3xl mb-2">1️⃣</div>
            <p>Daftar akun sebagai siswa atau guru</p>
          </div>

          <div>
            <div className="text-3xl mb-2">2️⃣</div>
            <p>Mulai belajar dengan latihan & game</p>
          </div>

          <div>
            <div className="text-3xl mb-2">3️⃣</div>
            <p>Kumpulkan poin & tingkatkan kemampuan</p>
          </div>

        </div>
      </div>

      {/* ================= CTA ================= */}
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold mb-3">
          Siap Belajar Bahasa Kaili?
        </h2>

        <button
          onClick={() => navigate("/register")}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
        >
          Mulai Sekarang 🚀
        </button>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="bg-gray-200 text-center py-4 text-sm text-gray-600">
        © 2026 Sora Kaili — Pelestarian Bahasa Daerah
      </div>

    </div>
  );
}

export default Landing;