import os

def replace_framer_motion():
    # 1. Append CSS to index.css
    css_path = "src/index.css"
    with open(css_path, "a", encoding="utf-8") as f:
        f.write("""
/* Custom organic animations replacing framer-motion */
@keyframes blob-morph {
  0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg); }
  50% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: rotate(180deg); }
}
.animate-blob-morph {
  animation: blob-morph 15s ease-in-out infinite;
}

@keyframes landing-float-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
.animate-landing-float-slow {
  animation: landing-float-slow 5s ease-in-out infinite;
}

@keyframes badge-float {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(15px) rotate(-5deg); }
}
.animate-badge-float {
  animation: badge-float 6s ease-in-out infinite;
}

@keyframes card-float {
  0%, 100% { transform: translateY(0) rotate(3deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
}
.animate-card-float {
  animation: card-float 5.5s ease-in-out infinite;
}
""")

    # 2. Update Landing.jsx
    landing_path = "src/pages/Landing.jsx"
    with open(landing_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove framer-motion import
    content = content.replace('import { motion } from "framer-motion";\n', '')

    # We need to replace the exact RIGHT SIDE composition we added earlier
    start_tag = "{/* RIGHT SIDE: Organic Blob Composition */}"
    if start_tag not in content:
        print("Could not find start tag")
        return
        
    start_idx = content.find(start_tag)
    end_idx = content.find("        </div>\n      </section>", start_idx)
    
    old_right_side = content[start_idx:end_idx]

    new_right_side = """{/* RIGHT SIDE: Organic Blob Composition (Pure CSS) */}
          <div className="relative flex justify-center lg:justify-end mt-16 lg:mt-0 w-full max-w-lg mx-auto">
            
            {/* Main Composition Container */}
            <div className="relative w-full aspect-square md:aspect-[4/3] flex items-center justify-center">
            
              {/* Morphing Blob Background */}
              <div
                className="absolute inset-2 md:inset-4 bg-gradient-to-tr from-kaili/40 via-green-400/20 to-purple-400/30 backdrop-blur-3xl shadow-xl border-4 border-white/40 z-0 animate-blob-morph"
              ></div>

              {/* Central Free-Floating Flat Illustration */}
              <div
                className="relative z-10 w-full h-[110%] flex items-end justify-center pointer-events-none animate-landing-float-slow"
              >
                <img 
                  src={KailiFlatImg} 
                  alt="Anak-anak belajar bahasa Kaili" 
                  className="h-full w-auto object-contain object-bottom mix-blend-multiply drop-shadow-xl"
                />
              </div>

              {/* Floating Element 1: Logo Badge */}
              <div
                className="absolute top-4 -right-4 lg:-right-12 z-30 bg-white/90 backdrop-blur-xl p-4 md:p-5 rounded-3xl shadow-soft-sora border-2 border-white flex items-center justify-center animate-badge-float"
              >
                <SoraKailiLogo className="h-8 md:h-12 w-auto" />
              </div>

              {/* Floating Element 2: Decorative Star / Element (Top Rightish) */}
              <div
                className="absolute -top-6 right-16 z-20 text-yellow-400 animate-spin"
                style={{ animationDuration: '8s' }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </div>

              {/* Floating Element 3: Mini Feature Card (Bottom Left) */}
              <div
                className="absolute -bottom-6 -left-4 lg:-left-10 z-20 bg-white/90 backdrop-blur-xl px-5 py-3 md:px-6 md:py-4 rounded-[2rem] shadow-xl border-2 border-white flex items-center gap-4 animate-card-float"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-kaili/10 flex items-center justify-center text-kaili font-black text-xl md:text-2xl shadow-inner">
                  🌟
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-black text-sora/50 uppercase tracking-widest">Pencapaian</p>
                  <p className="text-sm md:text-lg font-black text-sora leading-tight mt-0.5">Level 5 Terbuka!</p>
                </div>
              </div>

            </div>
          </div>
"""

    content = content.replace(old_right_side, new_right_side)

    with open(landing_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    replace_framer_motion()
