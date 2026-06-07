import os

def update_landing_image():
    landing_path = "src/pages/Landing.jsx"
    with open(landing_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Change import
    content = content.replace(
        'import KailiFlatImg from "../assets/kaili_flat_vector.png";',
        'import KailiTransparentImg from "../assets/kaili_transparent.png";'
    )

    # Change img src
    content = content.replace(
        'src={KailiFlatImg}',
        'src={KailiTransparentImg}'
    )

    with open(landing_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    update_landing_image()
