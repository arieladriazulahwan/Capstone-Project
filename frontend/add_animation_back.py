import os

def add_character_animation_back():
    landing_path = "src/pages/Landing.jsx"
    with open(landing_path, "r", encoding="utf-8") as f:
        content = f.read()

    # The character wrapper currently looks like:
    # <div className="relative z-10 w-full h-[110%] flex items-end justify-center pointer-events-none">
    
    old_char_wrapper = '<div className="relative z-10 w-full h-[110%] flex items-end justify-center pointer-events-none">'
    new_char_wrapper = '<div className="relative z-10 w-full h-[110%] flex items-end justify-center pointer-events-none animate-landing-float-slow">'

    content = content.replace(old_char_wrapper, new_char_wrapper)

    with open(landing_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    add_character_animation_back()
