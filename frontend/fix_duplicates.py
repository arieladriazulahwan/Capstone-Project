import os
import re

src_dir = "src"

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(".jsx") or f.endswith(".js"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8") as file:
                content = file.read()
            
            # The issue is we have:
            # import { HiSparkles } from "react-icons/hi";
            # import { FaRocket, HiSparkles } from "react-icons/fa";
            
            # We want to remove HiSparkles from the react-icons/fa import line only
            
            def replacer(match):
                imports_str = match.group(1)
                imports = [i.strip() for i in imports_str.split(",")]
                imports = [i for i in imports if i != "HiSparkles"]
                if not imports:
                    return ""
                return f"import {{ {', '.join(imports)} }} from \"react-icons/fa\";"
            
            content = re.sub(r'import\s+\{([^}]+)\}\s+from\s+["\']react-icons/fa["\'];?', replacer, content)
            
            # Also if we accidentally removed HiSparkles usage in the jsx, we must make sure it is imported exactly once from hi.
            if "HiSparkles" in content and "import { HiSparkles } from \"react-icons/hi\";" not in content:
                content = "import { HiSparkles } from \"react-icons/hi\";\n" + content
                
            with open(path, "w", encoding="utf-8") as file:
                file.write(content)
