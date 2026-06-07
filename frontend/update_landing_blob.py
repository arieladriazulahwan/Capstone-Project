import os

def update_landing_animation_blob():
    path = "src/pages/Landing.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Change import
    if "kaili_flat_vector.png" not in content:
        content = content.replace(
            'import KailiKidsImg from "../assets/kaili_kids.png";',
            'import KailiFlatImg from "../assets/kaili_flat_vector.png";'
        )

    # We need to replace the entire right side composition.
    # The current right side starts at `          {/* RIGHT SIDE: Animation Composition */}`
    # and ends right before `        </div>\n      </section>`
    
    start_tag = "{/* RIGHT SIDE: Animation Composition */}"
    if start_tag not in content:
        print("Could not find start tag")
        return
        
    start_idx = content.find(start_tag)
    end_idx = content.find("        </div>\n      </section>", start_idx)
    
    old_right_side = content[start_idx:end_idx]

    new_right_side = """{/* RIGHT SIDE: Organic Blob Composition */}
          <div className="relative flex justify-center lg:justify-end mt-16 lg:mt-0 w-full max-w-lg mx-auto">
            
            {/* Main Composition Container */}
            <div className="relative w-full aspect-square md:aspect-[4/3] flex items-center justify-center">
            
              {/* Morphing Blob Background */}
              <motion.div
                animate={{
                  borderRadius: [
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                    "30% 70% 70% 30% / 30% 30% 70% 70%",
                    "60% 40% 30% 70% / 60% 30% 70% 40%"
                  ],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 md:inset-4 bg-gradient-to-tr from-kaili/40 via-green-400/20 to-purple-400/30 backdrop-blur-3xl shadow-xl border-4 border-white/40 z-0"
              ></motion.div>

              {/* Central Free-Floating Flat Illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
                transition={{ 
                  opacity: { duration: 0.8, ease: "easeOut" },
                  scale: { duration: 0.8, ease: "easeOut" },
                  y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.8 } 
                }}
                className="relative z-10 w-full h-[110%] flex items-end justify-center pointer-events-none"
              >
                <img 
                  src={KailiFlatImg} 
                  alt="Anak-anak belajar bahasa Kaili" 
                  className="h-full w-auto object-contain object-bottom mix-blend-multiply drop-shadow-xl"
                />
              </motion.div>

              {/* Floating Element 1: Logo Badge (Moved explicitly to Right Side) */}
              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute top-4 -right-4 lg:-right-12 z-30 bg-white/90 backdrop-blur-xl p-4 md:p-5 rounded-3xl shadow-soft-sora border-2 border-white flex items-center justify-center"
              >
                <SoraKailiLogo className="h-8 md:h-12 w-auto" />
              </motion.div>

              {/* Floating Element 2: Decorative Star / Element (Top Rightish) */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute -top-6 right-16 z-20 text-yellow-400"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </motion.div>

              {/* Floating Element 3: Mini Feature Card (Bottom Left) */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-4 lg:-left-10 z-20 bg-white/90 backdrop-blur-xl px-5 py-3 md:px-6 md:py-4 rounded-[2rem] shadow-xl border-2 border-white flex items-center gap-4"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-kaili/10 flex items-center justify-center text-kaili font-black text-xl md:text-2xl shadow-inner">
                  🌟
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-black text-sora/50 uppercase tracking-widest">Pencapaian</p>
                  <p className="text-sm md:text-lg font-black text-sora leading-tight mt-0.5">Level 5 Terbuka!</p>
                </div>
              </motion.div>

            </div>
          </div>
"""

    content = content.replace(old_right_side, new_right_side)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    update_landing_animation_blob()
