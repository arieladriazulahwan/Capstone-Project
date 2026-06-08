import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import KailiTransparentImg from "../assets/kaili_transparent.png";
import SoraKailiLogo from "../components/SoraKailiLogo";
import { FiBookOpen, FiChevronRight, FiGlobe, FiLayers, FiStar, FiTarget, FiUsers, FiZap } from "react-icons/fi";
import { FaRocket } from "react-icons/fa";


const features = [
  {
    title: "Kamus Interaktif",
    text: "Temukan kosakata Kaili, arti, kategori, dan dialeknya dengan cepat dan menyenangkan.",
    icon: FiBookOpen,
    color: "text-kaili",
    bg: "bg-kaili/10",
  },
  {
    title: "Latihan Bertahap",
    text: "Belajar dari bab dan level yang tersusun rapi sesuai materi secara progresif.",
    icon: FiLayers,
    color: "text-sora",
    bg: "bg-sora/10",
  },
  {
    title: "Kuis & Gamifikasi",
    text: "Jawab kuis di room kelas, kumpulkan XP, dan pertahankan streak belajarmu!",
    icon: FaRocket,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

const steps = [
  { title: "Daftar Akun", desc: "Buat akun dengan mudah sebagai siswa atau guru.", icon: FiUsers },
  { title: "Pilih Materi", desc: "Mulai belajar dari level dasar hingga tingkat mahir.", icon: FiTarget },
  { title: "Kumpulkan XP", desc: "Kerjakan kuis dan bersaing di papan peringkat lokal.", icon: FiStar },
];

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] genz-bg text-sora font-sans selection:bg-kaili/30 overflow-x-hidden relative">


      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 md:pt-26 pb-24 px-4 flex justify-center">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT SIDE: Text & Stats */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left landing-rise">

            <div className="inline-flex items-center gap-3 md:gap-4 px-5 py-2 md:py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/60 shadow-sm mb-6 btn-bouncy cursor-default">
              <SoraKailiLogo className="h-5 md:h-12 w-auto drop-shadow-sm" />
              <div className="w-px h-4 md:h-5 bg-sora/20"></div>
              <span className="text-xs md:text-sm font-bold text-sora/80 tracking-wide uppercase mt-0.5">Cara Baru Belajar Bahasa Daerah</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.15] tracking-tight mb-6 text-sora drop-shadow-sm">
              Lestarikan <br className="hidden lg:block" /><span className="text-transparent bg-clip-text bg-gradient-to-br from-kaili to-green-600">Bahasa Kaili</span> <br className="hidden md:block lg:hidden" />
              Untuk Generasi Kita.
            </h1>

            <p className="text-lg md:text-xl text-sora/70 mb-10 max-w-xl leading-relaxed font-medium">
              Platform interaktif dengan materi, latihan bertahap, dan kuis gamifikasi.
              Mulai perjalananmu menguasai bahasa daerah dengan cara yang seru, ringan, dan modern!
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto bg-sora text-cream px-10 py-4 rounded-full font-black text-xl shadow-xl shadow-sora/20 hover:bg-sora/90 transition-all btn-bouncy flex items-center justify-center gap-2 group mb-14"
            >
              Mulai Petualangan <FiChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* QUICK STATS */}
            <div className="flex items-center justify-center lg:justify-start gap-6 md:gap-12 border-t border-sora/10 pt-8 w-full">
              {[
                { label: "Level Interaktif", value: "10+" },
                { label: "Kosakata", value: "500+" },
                { label: "Sistem Reward", value: "XP" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl md:text-4xl font-black text-sora mb-1">{stat.value}</p>
                  <p className="text-xs font-bold text-sora/50 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Transparent Character & Cool Elements */}
          <div className="relative flex justify-center lg:justify-end mt-16 lg:mt-0 w-full max-w-lg mx-auto landing-rise-delay">

            {/* Main Composition Container */}
            <div className="relative w-full aspect-square flex items-center justify-center">

              {/* Decorative Element 1: Subtle Grid / Dots (Static cool element) */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #163A2A 2px, transparent 2px)', backgroundSize: '16px 16px' }}>
              </div>

              {/* Decorative Element 2: Floating Circle (Static) */}
              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full border-4 border-kaili/20 z-0"></div>

              {/* Decorative Element 3: Star Shape */}
              <div className="absolute top-12 left-0 text-kaili/40 z-0">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </div>

              {/* Character Illustration (Transparent via multiply over page bg) */}
              {/* By removing the dark/colored gradient bubble, mix-blend-multiply creates a perfect transparent effect over the light page background. */}
              <div className="relative z-10 w-full h-[110%] flex items-end justify-center pointer-events-none">
                <img
                  src={KailiTransparentImg}
                  alt="Anak-anak belajar bahasa Kaili"
                  className="h-full w-auto object-contain object-bottom drop-shadow-sm"
                />
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative z-10 py-24 px-4 bg-white/40 backdrop-blur-xl border-y border-white/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 landing-rise">
            <span className="text-kaili font-black tracking-widest uppercase text-sm mb-2 block">Fitur Unggulan</span>
            <h2 className="text-4xl md:text-5xl font-black">Satu Platform, <br className="hidden md:block" />Banyak Keseruan.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-soft-sora hover:-translate-y-3 transition-all duration-300 group"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className={`w-16 h-16 rounded-[1.5rem] ${feat.bg} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner`}>
                    <Icon className={feat.color} strokeWidth={2.5} size={32} />
                  </div>
                  <h3 className="text-xl font-black mb-3">{feat.title}</h3>
                  <p className="text-sora/70 leading-relaxed font-medium text-sm">
                    {feat.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-sora text-cream rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-kaili/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Cara Kerja Sora Kaili</h2>
              <p className="text-cream/70 max-w-xl mx-auto font-medium">Mulai perjalanan belajarmu hanya dalam 3 langkah mudah.</p>
            </div>

            <div className="relative z-10 grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="text-center relative group">
                    {/* Connecting line for md+ */}
                    {i !== 2 && <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-kaili/50 to-transparent"></div>}

                    <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-kaili" />
                    </div>
                    <h3 className="text-xl font-black mb-2 text-white">{step.title}</h3>
                    <p className="text-cream/60 text-sm font-medium px-4">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-8 text-center border-t border-white/40">
        <p className="text-sora/50 font-bold text-sm">
          © {new Date().getFullYear()} Sora Kaili. Melestarikan Budaya Melalui Teknologi.
        </p>
      </footer>

    </div>
  );
}

export default Landing;
