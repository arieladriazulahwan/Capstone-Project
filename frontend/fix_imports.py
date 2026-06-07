import os
import re

src_dir = "src"

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(".jsx") or f.endswith(".js"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8") as file:
                content = file.read()
            
            import_regex = r"import\s+\{([^}]+)\}\s+from\s+[\"']lucide-react[\"'];?"
            match = re.search(import_regex, content)
            if match:
                icons_str = match.group(1)
                icons = [i.strip() for i in icons_str.split(",")]
                
                fi_icons = set()
                fa_icons = set()
                
                for icon in icons:
                    if not icon: continue
                    if icon.startswith("Fi"):
                        fi_icons.add(icon)
                    elif icon.startswith("Fa"):
                        fa_icons.add(icon)
                    else:
                        fi_icons.add("Fi" + icon)
                
                new_imports = ""
                if fi_icons:
                    new_imports += f"import {{ {', '.join(sorted(fi_icons))} }} from \"react-icons/fi\";\n"
                if fa_icons:
                    new_imports += f"import {{ {', '.join(sorted(fa_icons))} }} from \"react-icons/fa\";\n"
                
                content = content[:match.start()] + new_imports + content[match.end():]
                with open(path, "w", encoding="utf-8") as file:
                    file.write(content)
                print(f"Fixed {path}")
