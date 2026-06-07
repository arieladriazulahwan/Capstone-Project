import os

def simplify_landing_right_side():
    landing_path = "src/pages/Landing.jsx"
    with open(landing_path, "r", encoding="utf-8") as f:
        content = f.read()

    # The right side currently has the organic blob composition
    start_tag = "{/* RIGHT SIDE: Organic Blob Composition (Pure CSS) */}"
    if start_tag not in content:
        # try the old one if script didn't match perfectly before
        start_tag = "{/* RIGHT SIDE: Organic Blob Composition */}"
        
    if start_tag not in content:
        print("Could not find start tag")
        return
        
    start_idx = content.find(start_tag)
    end_idx = content.find("        </div>\n      </section>", start_idx)
    
    old_right_side = content[start_idx:end_idx]

    # New simplified layout: 
    # Just the character image and the logo in a clean, static, elegant layout.
    new_right_side = """{/* RIGHT SIDE: Simplified Static Layout */}
          <div className="relative flex justify-center lg:justify-end mt-16 lg:mt-0 w-full max-w-lg mx-auto landing-rise-delay">
            
            {/* Main Composition Container */}
            <div className="relative w-full aspect-square flex items-center justify-center">
            
              {/* Static Background Shape for contrast */}
              <div className="absolute inset-4 md:inset-8 bg-gradient-to-tr from-kaili/20 to-purple-400/10 rounded-full blur-2xl z-0 pointer-events-none"></div>

              {/* Character Illustration (Static) */}
              <div className="relative z-10 w-full h-[110%] flex items-end justify-center pointer-events-none">
                <img 
                  src={KailiFlatImg} 
                  alt="Anak-anak belajar bahasa Kaili" 
                  className="h-full w-auto object-contain object-bottom mix-blend-multiply drop-shadow-xl"
                />
              </div>

              {/* Logo Badge (Static) */}
              <div className="absolute top-4 -right-2 lg:-right-8 z-30 bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-3xl shadow-soft-sora border border-white/60 flex items-center justify-center">
                <SoraKailiLogo className="h-8 md:h-12 w-auto" />
              </div>

            </div>
          </div>
"""

    content = content.replace(old_right_side, new_right_side)

    with open(landing_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    simplify_landing_right_side()
