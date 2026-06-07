import os
import re

replacements = {
    # Leaderboard.jsx
    "Kompetisi 🏆": "<span className=\"inline-flex items-center gap-2\">Kompetisi <FaTrophy className=\"text-yellow-500\" /></span>",
    # Practice.jsx
    "Latihan Selesai 🌟": "<span className=\"inline-flex items-center gap-2 text-yellow-500\">Latihan Selesai <FaStar /></span>",
    "Ya, lanjut kuis 🚀": "<span className=\"inline-flex items-center justify-center gap-2\">Ya, lanjut kuis <FaRocket /></span>",
    # RegisterSiswa.jsx, RegisterGuru.jsx, LoginGuru.jsx, LoginSiswa.jsx
    "Buat Akun 🚀": "<span className=\"inline-flex items-center justify-center gap-2\">Buat Akun <FaRocket /></span>",
    "Buat Akun Guru 🚀": "<span className=\"inline-flex items-center justify-center gap-2\">Buat Akun Guru <FaRocket /></span>",
    "Masuk sebagai Guru 🚀": "<span className=\"inline-flex items-center justify-center gap-2\">Masuk sebagai Guru <FaRocket /></span>",
    "Masuk Sekarang 🚀": "<span className=\"inline-flex items-center justify-center gap-2\">Masuk Sekarang <FaRocket /></span>",
    "Mulai Latihan 🚀": "<span className=\"inline-flex items-center justify-center gap-2\">Mulai Latihan <FaRocket /></span>",
    # Dashboard.jsx
    "Halo, {user?.name || \"User\"} ✨": "<span className=\"inline-flex items-center gap-2\">Halo, {user?.name || \"User\"} <HiSparkles className=\"text-yellow-400\" /></span>",
    "Ayo tingkatkan kemampuan Bahasa Kaili-mu hari ini! 🚀": "<span className=\"inline-flex items-center gap-2\">Ayo tingkatkan kemampuan Bahasa Kaili-mu hari ini! <FaRocket className=\"text-kaili\" /></span>",
    "<span className=\"text-lg\">🔥</span>": "<FaFire className=\"inline text-orange-500 text-lg\" />",
    "🏆 {user.title?.toUpperCase() || \"PEMULA\"} 🏆": "<span className=\"inline-flex items-center gap-2 text-yellow-500\"><FaTrophy /> {user.title?.toUpperCase() || \"PEMULA\"} <FaTrophy /></span>",
    "🏆 {user.title?.toUpperCase()} 🏆": "<span className=\"inline-flex items-center gap-2 text-yellow-500\"><FaTrophy /> {user.title?.toUpperCase()} <FaTrophy /></span>",
    # Lesson.jsx
    "Materi belum tersedia 😔": "<span className=\"inline-flex items-center gap-2\">Materi belum tersedia <FaFrown className=\"text-red-400\" /></span>",
    # Level.jsx
    "Level Kamu 🌟": "<span className=\"inline-flex items-center gap-2\">Level Kamu <FaStar className=\"text-yellow-500\" /></span>",
    "{100 - progress} XP lagi untuk naik level 🚀": "<span className=\"inline-flex items-center gap-2\">{100 - progress} XP lagi untuk naik level <FaRocket className=\"text-kaili\" /></span>",
    "Reward Level 🎁": "<span className=\"inline-flex items-center gap-2\">Reward Level <FaGift className=\"text-red-500\" /></span>",
    "Peta Belajar - Dialek {dialect.toUpperCase()} 🗺️": "<span className=\"inline-flex items-center gap-2\">Peta Belajar - Dialek {dialect.toUpperCase()} <FaMap className=\"text-blue-500\" /></span>",
    "Target Selanjutnya 🎯": "<span className=\"inline-flex items-center gap-2\">Target Selanjutnya <FiTarget className=\"text-red-500\" /></span>",
    # Kamus.jsx
    "Kamus 📖": "<span className=\"inline-flex items-center gap-2\">Kamus <FiBookOpen /></span>"
}

# Define which icons are needed from which packages
icon_packages = {
    "FaTrophy": "react-icons/fa",
    "FaStar": "react-icons/fa",
    "FaRocket": "react-icons/fa",
    "HiSparkles": "react-icons/hi",
    "FaFire": "react-icons/fa",
    "FaFrown": "react-icons/fa",
    "FaGift": "react-icons/fa",
    "FaMap": "react-icons/fa",
    "FiTarget": "react-icons/fi",
    "FiBookOpen": "react-icons/fi"
}

def add_import(content, icon_name, pkg):
    if f"import {{ {icon_name}" in content or f" {icon_name}," in content or f", {icon_name} " in content:
        return content # Already imported
    
    # Try to find existing import from the package
    regex = re.compile(rf'import\s+{{([^}}]+)}}\s+from\s+["\']{pkg}["\'];?')
    match = regex.search(content)
    if match:
        existing_imports = match.group(1).strip()
        new_import_str = f"import {{ {existing_imports}, {icon_name} }} from \"{pkg}\";"
        content = content[:match.start()] + new_import_str + content[match.end():]
    else:
        # Add to top
        new_import = f"import {{ {icon_name} }} from \"{pkg}\";\n"
        content = new_import + content
    return content

src_dir = "src"

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(".jsx") or f.endswith(".js"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8") as file:
                content = file.read()
                
            original_content = content
            
            for old_text, new_text in replacements.items():
                if old_text in content:
                    content = content.replace(old_text, new_text)
                    # Check which icons were used in new_text
                    for icon, pkg in icon_packages.items():
                        if f"<{icon}" in new_text:
                            content = add_import(content, icon, pkg)
            
            if content != original_content:
                with open(path, "w", encoding="utf-8") as file:
                    file.write(content)
                print(f"Updated {path}")

