import os

def is_emoji(c):
    code = ord(c)
    # Check if character falls into typical emoji/symbol unicode blocks
    return (0x1F300 <= code <= 0x1F9FF) or \
           (0x2600 <= code <= 0x26FF) or \
           (0x2700 <= code <= 0x27BF) or \
           (0x1F600 <= code <= 0x1F64F) or \
           (0x1F680 <= code <= 0x1F6FF)

def find_emojis(src_dir):
    found_any = False
    for root, _, files in os.walk(src_dir):
        for f in files:
            if f.endswith(".jsx") or f.endswith(".js"):
                path = os.path.join(root, f)
                with open(path, "r", encoding="utf-8") as file:
                    lines = file.readlines()
                
                for i, line in enumerate(lines):
                    emojis_in_line = [c for c in line if is_emoji(c)]
                    if emojis_in_line:
                        found_any = True
                        print(f"[{f}:{i+1}] Found emoji '{''.join(emojis_in_line)}': {line.strip()}")

    if not found_any:
        print("No native emojis found!")

if __name__ == "__main__":
    find_emojis("src")
