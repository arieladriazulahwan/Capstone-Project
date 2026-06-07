import os

def redesign_landing_transparent():
    landing_path = "src/pages/Landing.jsx"
    with open(landing_path, "r", encoding="utf-8") as f:
        content = f.read()

    # The current right side
    start_tag = "{/* RIGHT SIDE: Simplified Static Layout */}"
    if start_tag not in content:
        print("Could not find start tag")
        return
        
    start_idx = content.find(start_tag)
    end_idx = content.find("        </div>\n      </section>", start_idx)
    
    old_right_side = content[start_idx:end_idx]

    new_right_side = """{/* RIGHT SIDE: Transparent Character & Cool Elements */}
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
                  src={KailiFlatImg} 
                  alt="Anak-anak belajar bahasa Kaili" 
                  className="h-full w-auto object-contain object-bottom mix-blend-multiply drop-shadow-sm"
                />
              </div>

              {/* Logo Placement (Neatly placed at top right to balance) */}
              <div className="absolute top-8 -right-4 lg:-right-8 z-30 bg-white/60 backdrop-blur-md px-6 py-4 rounded-3xl shadow-sm border border-white/80 flex items-center justify-center">
                <SoraKailiLogo className="h-8 md:h-10 w-auto" />
              </div>

              {/* A subtle secondary cool element (Vocabulary badge) but purely static and clean */}
              <div className="absolute bottom-4 -right-2 lg:-right-6 z-20 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-soft-sora border border-white/60 flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <span className="font-bold text-sm text-sora">Ayo Belajar!</span>
              </div>

            </div>
          </div>
"""

    content = content.replace(old_right_side, new_right_side)

    with open(landing_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    redesign_landing_transparent()
