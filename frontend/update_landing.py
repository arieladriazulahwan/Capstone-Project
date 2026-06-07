import os

def update_landing():
    path = "src/pages/Landing.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add imports
    if "framer-motion" not in content:
        content = content.replace(
            'import { useNavigate } from "react-router-dom";',
            'import { useNavigate } from "react-router-dom";\nimport { motion } from "framer-motion";\nimport KailiKidsImg from "../assets/kaili_kids.png";'
        )

    # 2. Replace Hero Section
    old_hero = """      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 md:pt-26 pb-24 px-4 flex justify-center text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">

          <div className="landing-rise flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/60 shadow-sm mb-6 btn-bouncy cursor-default">
              <HiSparkles className="text-kaili w-4 h-4" />
              <span className="text-sm font-bold text-sora/80 tracking-wide uppercase">Cara Baru Belajar Bahasa Daerah</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.15] tracking-tight mb-6 text-sora drop-shadow-sm">
              Lestarikan <span className="text-transparent bg-clip-text bg-gradient-to-br from-kaili to-green-600">Bahasa Kaili</span> <br className="hidden md:block" />
              Untuk Generasi Kita.
            </h1>

            <p className="text-lg md:text-xl text-sora/70 mb-10 max-w-2xl leading-relaxed font-medium">
              Platform interaktif dengan materi, latihan bertahap, dan kuis gamifikasi.
              Mulai perjalananmu menguasai bahasa daerah dengan cara yang seru, ringan, dan modern!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto bg-sora text-cream px-10 py-4 rounded-full font-black text-xl shadow-xl shadow-sora/20 hover:bg-sora/90 transition-all btn-bouncy flex items-center justify-center gap-2 group"
              >
                Mulai Petualangan <FiChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* QUICK STATS */}
            <div className="mt-14 flex items-center justify-center gap-12 border-t border-sora/10 pt-8">
              {[
                { label: "Level Interaktif", value: "10+" },
                { label: "Kosakata", value: "500+" },
                { label: "Sistem Reward", value: "XP" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-4xl font-black text-sora mb-1">{stat.value}</p>
                  <p className="text-xs font-bold text-sora/50 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>"""

    new_hero = """      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 md:pt-26 pb-24 px-4 flex justify-center">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SIDE: Text & Stats */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left landing-rise">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/60 shadow-sm mb-6 btn-bouncy cursor-default">
              <HiSparkles className="text-kaili w-4 h-4" />
              <span className="text-sm font-bold text-sora/80 tracking-wide uppercase">Cara Baru Belajar Bahasa Daerah</span>
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

          {/* RIGHT SIDE: Animation */}
          <div className="relative flex justify-center lg:justify-end mt-12 lg:mt-0 landing-rise-delay">
            {/* Main Image */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative z-10"
            >
              <img 
                src={KailiKidsImg} 
                alt="Anak-anak belajar bahasa Kaili" 
                className="w-full max-w-[350px] md:max-w-[450px] drop-shadow-2xl"
              />
            </motion.div>

            {/* Floating Logo Badge */}
            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute top-0 lg:top-10 -left-4 lg:-left-12 z-20 bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl border border-white/60"
            >
              <SoraKailiLogo className="h-8 md:h-12 w-auto" />
            </motion.div>

            {/* Background Blob/Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[450px] md:h-[450px] bg-kaili/20 blur-[60px] md:blur-[80px] rounded-full pointer-events-none -z-10"></div>
          </div>

        </div>
      </section>"""

    content = content.replace(old_hero, new_hero)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    update_landing()
