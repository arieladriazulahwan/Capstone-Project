import os
import re

src_dir = "src"

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(".jsx") or f.endswith(".js"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8") as file:
                content = file.read()
            
            if "FaSparkles" in content:
                content = content.replace("FaSparkles", "HiSparkles")
                
                # Check if react-icons/hi is imported, if not add it
                if "react-icons/hi" not in content:
                    content = "import { HiSparkles } from \"react-icons/hi\";\n" + content
                else:
                    # just ensure HiSparkles is in the import. A bit tricky, but since we are just appending it it's easier to add a new line
                    content = "import { HiSparkles } from \"react-icons/hi\";\n" + content
                
                # We need to remove FaSparkles from react-icons/fa imports if it's there
                content = re.sub(r'FaSparkles\s*,?\s*', '', content)
                # Cleanup empty imports
                content = re.sub(r'import\s*\{\s*\}\s*from\s*["\']react-icons/fa["\'];\n?', '', content)
                
                with open(path, "w", encoding="utf-8") as file:
                    file.write(content)
                print(f"Fixed {path}")
