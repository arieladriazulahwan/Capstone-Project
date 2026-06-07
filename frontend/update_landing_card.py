import os

def update_landing_animation():
    path = "src/pages/Landing.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # The right side currently looks like:
    old_right_side = """          {/* RIGHT SIDE: Animation */}
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
          </div>"""

    # We want a much better card layout. Let's make a stacked glassmorphic card design.
    new_right_side = """          {/* RIGHT SIDE: Animation Composition */}
          <div className="relative flex justify-center lg:justify-end mt-16 lg:mt-0 w-full max-w-lg mx-auto">
            
            {/* Main Composition Container */}
            <div className="relative w-full aspect-square md:aspect-[4/3] flex items-center justify-center">
            
              {/* Background Glow */}
              <motion.div 
                animate={{ scale: [1, 1.05, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-tr from-kaili/30 to-purple-500/20 rounded-[4rem] blur-3xl pointer-events-none -z-10"
              ></motion.div>

              {/* Central Glass Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full h-full bg-white/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] border border-white/60 shadow-2xl p-6 md:p-8 flex flex-col items-center justify-end overflow-hidden group"
              >
                {/* Decorative inner gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent pointer-events-none z-0"></div>

                {/* Animated Image */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative z-10 h-[85%] flex items-end justify-center drop-shadow-2xl"
                >
                  <img 
                    src={KailiKidsImg} 
                    alt="Anak-anak belajar bahasa Kaili" 
                    className="h-full w-auto object-contain object-bottom group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>

                {/* Card Title Label */}
                <div className="relative z-20 w-full mt-4 bg-white/90 backdrop-blur-md rounded-2xl py-3 px-5 shadow-soft-sora border border-white/50 text-center">
                  <p className="font-black text-sora tracking-wide">Jelajahi Dunia Kaili</p>
                  <p className="text-xs font-bold text-sora/60 mt-0.5">Belajar jadi lebih seru!</p>
                </div>
              </motion.div>

              {/* Floating Element 1: Logo Badge (Moved to Right) */}
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-4 -right-6 lg:-right-12 z-30 bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-white/80"
              >
                <SoraKailiLogo className="h-8 md:h-12 w-auto" />
              </motion.div>

              {/* Floating Element 2: Small Vocab Card (Bottom Left) */}
              <motion.div
                animate={{ y: [0, 10, 0], rotate: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -left-4 lg:-left-10 z-20 bg-kaili text-cream px-5 py-3 rounded-2xl shadow-[0_10px_30px_-5px_rgba(34,197,94,0.4)] border border-white/20 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black">
                  📖
                </div>
                <div>
                  <p className="text-xs font-bold text-cream/70 uppercase">Kosakata Baru</p>
                  <p className="text-lg font-black leading-tight">Nosipato</p>
                </div>
              </motion.div>

            </div>
          </div>"""

    content = content.replace(old_right_side, new_right_side)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    update_landing_animation()
