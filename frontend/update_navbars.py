import os
import re

def update_imports(content):
    content = re.sub(r'import\s+NavbarAdmin\s+from\s+["\'](\.\./components/NavbarAdmin)["\'];', 'import Navbar from "../components/Navbar";', content)
    content = re.sub(r'import\s+SidebarAdmin\s+from\s+["\'](\.\./components/SidebarAdmin)["\'];', 'import Sidebar from "../components/Sidebar";', content)
    content = re.sub(r'import\s+BottomNavAdmin\s+from\s+["\'](\.\./components/BottomNavAdmin)["\'];', 'import BottomNav from "../components/BottomNav";', content)
    content = re.sub(r'import\s+NavbarGuru\s+from\s+["\'](\.\./components/NavbarGuru)["\'];', 'import Navbar from "../components/Navbar";', content)
    
    # In case there are duplicates or missing imports
    if "<Sidebar" in content and "import Sidebar from" not in content:
        content = 'import Sidebar from "../components/Sidebar";\n' + content
    if "<BottomNav" in content and "import BottomNav from" not in content:
        content = 'import BottomNav from "../components/BottomNav";\n' + content
        
    return content

def update_jsx(content):
    # Admin
    content = re.sub(r'<NavbarAdmin([^>]*)>', r'<Navbar role="admin"\1>', content)
    content = re.sub(r'<SidebarAdmin([^>]*)/>', r'<Sidebar role="admin"\1/>', content)
    content = re.sub(r'<BottomNavAdmin([^>]*)/>', r'<BottomNav role="admin"\1/>', content)
    
    # Guru
    content = re.sub(r'<NavbarGuru([^>]*)>', r'<Navbar role="guru"\1>', content)
    
    # Convert old layouts to new unified robust layout
    # "min-h-screen" -> "h-screen overflow-hidden"
    # "flex-1 flex flex-col" -> "flex-1 h-screen overflow-y-auto custom-scrollbar relative"
    
    # Standardize the outer wrapper
    content = re.sub(
        r'className="([^"]*)min-h-screen([^"]*)"', 
        r'className="\1h-screen overflow-hidden\2"', 
        content
    )
    
    content = re.sub(
        r'className="flex-1 flex flex-col"',
        r'className="flex-1 h-screen overflow-y-auto custom-scrollbar relative"',
        content
    )
    
    # Guru didn't have Sidebar or BottomNav. If we see <Navbar role="guru"
    # we should ideally inject Sidebar. But doing this via regex is risky.
    # We will do a targeted replacement for DashboardGuru, BuatRoom, DetailRoom
    
    return content

src_dir = "src/pages"

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(".jsx"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8") as file:
                original_content = file.read()
                
            content = update_imports(original_content)
            content = update_jsx(content)
            
            if content != original_content:
                with open(path, "w", encoding="utf-8") as file:
                    file.write(content)
                print(f"Updated {path}")
