import { useNavigate } from "react-router-dom";
import SoraKailiLogo from "../components/SoraKailiLogo";

const features = [
  {
    title: "Kamus Interaktif",
    text: "Temukan kosakata Kaili, arti, kategori, dan dialeknya dengan cepat.",
    icon: "K",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Latihan Bertahap",
    text: "Belajar dari bab dan level yang tersusun rapi sesuai materi.",
    icon: "L",
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Kuis & Room",
    text: "Guru dapat membuat room, siswa menjawab, nilai langsung tercatat.",
    icon: "Q",
    color: "bg-yellow-100 text-yellow-700",
  },
];

const steps = [
  "Pilih akun siswa atau guru",
  "Belajar materi dan latihan",
  "Kumpulkan XP, streak, dan nilai",
];

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-gray-100 text-left">
      <section className="relative min-h-[92vh] bg-gradient-to-br from-green-50 via-white to-blue-50 px-4 py-6">
        <div className="pointer-events-none absolute left-6 top-20 h-24 w-24 rounded-full bg-green-200/50 blur-3xl landing-float"></div>
        <div className="pointer-events-none absolute bottom-24 right-10 h-32 w-32 rounded-full bg-yellow-200/60 blur-3xl landing-float-slow"></div>

        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <SoraKailiLogo className="h-24 w-40 overflow-hidden" imgClassName="scale-[1.45]" />
          <button
            onClick={() => navigate("/login")}
            className="rounded-full border border-green-200 bg-white/80 px-5 py-2 text-sm font-semibold text-green-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-green-50"
          >
            Masuk
          </button>
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 pt-8 md:grid-cols-[1.15fr_0.85fr] md:pt-14">
          <div className="landing-rise">
            <p className="mb-4 inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              Platform belajar Bahasa Kaili
            </p>

            <h1 className="mb-5 max-w-2xl text-4xl font-black leading-tight text-gray-900 md:text-6xl">
              Sora Kaili
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-gray-600 md:text-lg">
              Belajar bahasa daerah dengan materi, latihan, kuis, room kelas,
              streak, dan gamifikasi yang terasa ringan untuk dipakai setiap hari.
            </p>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                ["2", "Dialek"],
                ["10+", "Level"],
                ["XP", "Progress"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white bg-white/80 p-4 text-center shadow-sm backdrop-blur">
                  <p className="text-2xl font-black text-green-600">{value}</p>
                  <p className="text-xs font-semibold text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-rise-delay rounded-[2rem] border border-white bg-white/85 p-5 shadow-2xl backdrop-blur">
            <div className="flex justify-center">
              <SoraKailiLogo className="h-36 w-56" />
            </div>

            <div className="mt-2 rounded-3xl bg-gray-50 p-4">
              <p className="mb-3 text-center text-sm font-bold text-gray-700">Masuk sebagai</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/login/siswa")}
                  className="group rounded-2xl border border-green-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:bg-green-50 hover:shadow-md"
                >
                  <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-lg font-black text-green-700 transition group-hover:scale-110">
                    S
                  </span>
                  <span className="font-bold text-gray-800">Siswa</span>
                </button>

                <button
                  onClick={() => navigate("/login/guru")}
                  className="group rounded-2xl border border-blue-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                >
                  <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-lg font-black text-blue-700 transition group-hover:scale-110">
                    G
                  </span>
                  <span className="font-bold text-gray-800">Guru</span>
                </button>
              </div>

              <p className="mt-5 text-center text-sm text-gray-500">
                Belum punya akun?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-bold text-green-600 hover:text-green-700"
                >
                  Daftar di sini
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-green-600">Tentang Kami</p>
          <h2 className="mx-auto mb-4 max-w-2xl text-3xl font-black text-gray-900">
            Belajar bahasa Kaili dibuat lebih dekat dengan keseharian.
          </h2>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600">
            Sora Kaili membantu siswa mengenal kosakata, kalimat, latihan, dan
            kuis interaktif, sambil memberi guru ruang untuk membuat aktivitas
            kelas yang mudah dipantau.
          </p>
        </div>
      </section>

      <section className="bg-gray-100 px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-2 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-600">Fitur Unggulan</p>
            <h2 className="text-3xl font-black text-gray-900">Satu tempat untuk belajar dan mengajar</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="landing-card rounded-3xl border border-white bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-black text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-9 text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-green-600">Cara Kerja</p>
            <h2 className="text-3xl font-black text-gray-900">Mulai dalam tiga langkah</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="relative rounded-3xl bg-gray-50 p-5 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-sm font-black text-white">
                  {index + 1}
                </div>
                <p className="font-bold text-gray-800">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-14 text-center text-white">
        <h2 className="mb-3 text-3xl font-black text-white">Siap belajar Bahasa Kaili?</h2>
        <p className="mx-auto mb-6 max-w-xl text-green-50">
          Buat akun dan mulai jelajahi materi, latihan, kuis, dan room kelas.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="rounded-2xl bg-white px-7 py-3 font-bold text-green-700 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
        >
          Mulai Sekarang
        </button>
      </section>

      <footer className="bg-gray-200 py-5 text-center text-sm text-gray-600">
        © 2026 Sora Kaili - Pelestarian Bahasa Daerah
      </footer>
    </div>
  );
}

export default Landing;
