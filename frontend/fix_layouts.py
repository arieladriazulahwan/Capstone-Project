import os
import re

files_to_fix = [
    "Dashboard.jsx", "Level.jsx", "Kamus.jsx", 
    "AdminRooms.jsx", "AdminKamus.jsx", "DashboardAdmin.jsx", "AdminUsers.jsx", "AdminMateri.jsx",
    "DashboardGuru.jsx", "BuatRoom.jsx", "DetailRoom.jsx"
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine role
    role = "siswa"
    if "Guru" in filepath or "Room" in filepath:
        role = "guru"
    if "Admin" in filepath:
        role = "admin"
        
    # Inject imports if missing
    if "import Sidebar from" not in content:
        content = 'import Sidebar from "../components/Sidebar";\n' + content
    if "import BottomNav from" not in content:
        content = 'import BottomNav from "../components/BottomNav";\n' + content

    # Use regex to find the `return (` block. This might be tricky because there are multiple `return (`.
    # Usually the main component return is the last `return (`.
    # Or we can just replace the outer div classes.
    
    # 1. Standardize outer div
    # Before: <div className="... h-screen overflow-hidden ...">
    # After: <div className="flex h-screen overflow-hidden genz-bg text-sora">
    content = re.sub(
        r'<div className="[^"]*h-screen overflow-hidden[^"]*">',
        r'<div className="flex h-screen overflow-hidden genz-bg text-sora">',
        content
    )
    
    # 2. Standardize inner wrapper
    # Before: <div className="flex-1 flex flex-col min-w-0"> or similar
    content = re.sub(
        r'<div className="flex-1 flex flex-col[^"]*">',
        r'<div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">',
        content
    )
    content = re.sub(
        r'<div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative relative">',
        r'<div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">',
        content
    )
    
    # 3. Standardize main
    content = re.sub(
        r'<main className="flex-1 [^"]*">',
        r'<main className="px-4 pb-24 md:pb-6 pt-4 flex justify-center min-h-full">',
        content
    )
    
    # Ensure Sidebar and BottomNav are present inside the outer div.
    # This is too hard with regex. Let's just do targeted replaces.
    return content

src_dir = "src/pages"
for file in files_to_fix:
    path = os.path.join(src_dir, file)
    if os.path.exists(path):
        new_content = process_file(path)
        # We will not write immediately. Let's use string replaces instead.

