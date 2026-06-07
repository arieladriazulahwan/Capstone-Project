import os

def remove_float_and_multiply():
    landing_path = "src/pages/Landing.jsx"
    with open(landing_path, "r", encoding="utf-8") as f:
        content = f.read()

    # The character wrapper currently looks like:
    # <div className="relative z-10 w-full h-[110%] flex items-end justify-center pointer-events-none animate-landing-float-slow">
    old_wrapper = '<div className="relative z-10 w-full h-[110%] flex items-end justify-center pointer-events-none animate-landing-float-slow">'
    new_wrapper = '<div className="relative z-10 w-full h-[110%] flex items-end justify-center pointer-events-none">'
    content = content.replace(old_wrapper, new_wrapper)

    # The img tag currently looks like:
    # <img 
    #   src={KailiFlatImg} 
    #   alt="Anak-anak belajar bahasa Kaili" 
    #   className="h-full w-auto object-contain object-bottom mix-blend-multiply drop-shadow-sm"
    # />
    old_img = 'className="h-full w-auto object-contain object-bottom mix-blend-multiply drop-shadow-sm"'
    new_img = 'className="h-full w-auto object-contain object-bottom drop-shadow-sm"'
    content = content.replace(old_img, new_img)

    with open(landing_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    remove_float_and_multiply()
