import os

def fix_guru_pages():
    guru_files = ["DashboardGuru.jsx", "BuatRoom.jsx", "DetailRoom.jsx"]
    src_dir = "src/pages"
    
    for f in guru_files:
        path = os.path.join(src_dir, f)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as file:
            content = file.read()
            
        if "import Sidebar" not in content:
            content = 'import Sidebar from "../components/Sidebar";\n' + content
        if "import BottomNav" not in content:
            content = 'import BottomNav from "../components/BottomNav";\n' + content
            
        # Target:
        # <div className="h-screen overflow-hidden genz-bg text-sora">
        #   <Navbar role="guru" user={...} />
        #   <main ...>
        
        # We need to wrap it correctly.
        # It's easier to just replace the first `<Navbar role="guru"` line.
        
        # There are usually two return blocks (loading/error and main).
        
        # Replace the outer div
        content = content.replace('<div className="h-screen overflow-hidden genz-bg text-sora">', '<div className="flex h-screen overflow-hidden genz-bg text-sora">')
        
        # Replace Navbar line with Sidebar + wrapper + Navbar
        content = content.replace('<Navbar role="guru" user={null} />', '<Sidebar role="guru" />\n        <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">\n          <Navbar role="guru" user={null} />')
        content = content.replace('<Navbar role="guru" user={user} />', '<Sidebar role="guru" />\n        <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">\n          <Navbar role="guru" user={user} />')
        content = content.replace('<Navbar role="guru" user={user} showBackButton={true} />', '<Sidebar role="guru" />\n        <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">\n          <Navbar role="guru" user={user} showBackButton={true} />')
        content = content.replace('<Navbar role="guru" user={user} showBackButton />', '<Sidebar role="guru" />\n        <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">\n          <Navbar role="guru" user={user} showBackButton />')

        # We also need to add </BottomNav> and close the wrapper </div> before the final </div> of the component.
        # This is tricky. But since the old layout had </div> closing the <div className="h-screen...">, 
        # now we opened an extra <div className="flex-1...">, we must close it.
        # So we replace the final </div> with </div>\n      <BottomNav role="guru" />\n    </div>
        # Actually, it's safer to replace `</main>\n      </div>\n    );` with `</main>\n        </div>\n        <BottomNav role="guru" />\n      </div>\n    );`
        
        content = content.replace('</main>\n      </div>\n    );', '</main>\n        </div>\n        <BottomNav role="guru" />\n      </div>\n    );')
        content = content.replace('</main>\n    </div>\n  );', '</main>\n        </div>\n        <BottomNav role="guru" />\n      </div>\n  );')

        # Fix DashboardGuru ConfirmDialog location
        content = content.replace('<ConfirmDialog', '</div>\n        <BottomNav role="guru" />\n      </div>\n\n      <ConfirmDialog')
        
        with open(path, "w", encoding="utf-8") as file:
            file.write(content)

if __name__ == "__main__":
    fix_guru_pages()
