import os

def fix_siswa_pages():
    siswa_files = ["Dashboard.jsx", "Level.jsx", "Kamus.jsx", "Leaderboard.jsx", "Favorites.jsx", "BabLevels.jsx"]
    src_dir = "src/pages"
    
    for f in siswa_files:
        path = os.path.join(src_dir, f)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as file:
            content = file.read()
            
        if "import BottomNav" not in content:
            content = 'import BottomNav from "../components/BottomNav";\n' + content
            
        # Standardize the end of the file.
        # It usually ends with:
        #         </main>
        #       </div>
        #     </div>
        #   );
        # Or something similar.
        # We can just replace `{/* MOBILE NAV (Removed) */}` with `<BottomNav />`
        if "{/* MOBILE NAV (Removed) */}" in content:
            content = content.replace("{/* MOBILE NAV (Removed) */}", "<BottomNav />")
        
        # If it doesn't have it, let's inject it before the last </div>
        # But wait, `Dashboard.jsx` DID have `{/* MOBILE NAV (Removed) */}`.
        # Let's check `Level.jsx`...
        elif "BottomNav" not in content.split("return (")[-1]:
            # This is hard to do robustly with string replace since indentations vary.
            # But normally it's:
            content = content.replace(
                '        </main>\n      </div>\n    </div>\n  );\n}',
                '        </main>\n      </div>\n      <BottomNav />\n    </div>\n  );\n}'
            )
            content = content.replace(
                '        </main>\n      </div>\n    </div>\n  );',
                '        </main>\n      </div>\n      <BottomNav />\n    </div>\n  );'
            )
            
        with open(path, "w", encoding="utf-8") as file:
            file.write(content)

if __name__ == "__main__":
    fix_siswa_pages()
