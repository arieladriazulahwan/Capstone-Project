import os

def fix_guru_again():
    src_dir = "src/pages"
    
    # DashboardGuru
    f = os.path.join(src_dir, "DashboardGuru.jsx")
    with open(f, "r") as file:
        content = file.read()
    
    content = content.replace('import { BookOpenCheck, Clock3, Plus, Presentation, Sparkles } from "lucide-react";', 'import { FiCheckSquare, FiClock, FiPlus, FiMonitor } from "react-icons/fi";\nimport { HiSparkles } from "react-icons/hi";')
    content = content.replace('<BookOpenCheck', '<FiCheckSquare')
    content = content.replace('<Clock3', '<FiClock')
    content = content.replace('<Plus', '<FiPlus')
    content = content.replace('<Presentation', '<FiMonitor')
    content = content.replace('<Sparkles', '<HiSparkles')
    
    content = content.replace('<Navbar role="guru" user={user} />', '<Sidebar role="guru" />\n      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">\n        <Navbar role="guru" user={user} />')
    content = content.replace('<Navbar role="guru" user={null} />', '<Sidebar role="guru" />\n        <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">\n          <Navbar role="guru" user={null} />')
    content = content.replace('<div className="teacher-page-bg h-screen overflow-hidden bg-gray-100">', '<div className="flex h-screen overflow-hidden genz-bg text-sora">')
    content = content.replace('<div className="teacher-page-bg h-screen overflow-hidden flex items-center justify-center">', '<div className="flex h-screen overflow-hidden genz-bg text-sora items-center justify-center">')
    
    # Close wrapper
    content = content.replace('      <ConfirmDialog', '      </div>\n      <BottomNav role="guru" />\n      <ConfirmDialog')
    
    with open(f, "w") as file:
        file.write(content)

    # BuatRoom
    f = os.path.join(src_dir, "BuatRoom.jsx")
    with open(f, "r") as file:
        content = file.read()
        
    content = content.replace('import { BookOpen, Clock3, Type } from "lucide-react";', 'import { FiBookOpen, FiClock, FiType } from "react-icons/fi";')
    content = content.replace('<BookOpen', '<FiBookOpen')
    content = content.replace('<Clock3', '<FiClock')
    content = content.replace('<Type', '<FiType')
    
    content = content.replace('<Navbar role="guru" user={null} />', '<Sidebar role="guru" />\n        <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">\n          <Navbar role="guru" user={null} />')
    content = content.replace('<Navbar role="guru" user={user} showBackButton={true} />', '<Sidebar role="guru" />\n      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">\n        <Navbar role="guru" user={user} showBackButton={true} />')
    content = content.replace('<div className="teacher-page-bg min-h-screen">', '<div className="flex h-screen overflow-hidden genz-bg text-sora">')
    content = content.replace('<div className="teacher-page-bg h-screen overflow-hidden flex items-center justify-center">', '<div className="flex h-screen overflow-hidden genz-bg text-sora items-center justify-center">')
    
    # Close wrapper
    if "BottomNav" not in content:
        content = content.replace('    </div>\n  );\n}', '      </div>\n      <BottomNav role="guru" />\n    </div>\n  );\n}')
    
    with open(f, "w") as file:
        file.write(content)

    # DetailRoom
    f = os.path.join(src_dir, "DetailRoom.jsx")
    with open(f, "r") as file:
        content = file.read()
        
    content = content.replace('<Navbar role="guru" user={null} />', '<Sidebar role="guru" />\n        <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">\n          <Navbar role="guru" user={null} />')
    content = content.replace('<Navbar role="guru" user={user} showBackButton />', '<Sidebar role="guru" />\n      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">\n        <Navbar role="guru" user={user} showBackButton />')
    content = content.replace('<div className="teacher-page-bg min-h-screen">', '<div className="flex h-screen overflow-hidden genz-bg text-sora">')
    content = content.replace('<div className="teacher-page-bg h-screen overflow-hidden flex items-center justify-center">', '<div className="flex h-screen overflow-hidden genz-bg text-sora items-center justify-center">')
    
    # Fix the ConfirmDialog syntax error
    # It might be caused by replacing too many things earlier.
    # We will just inject the BottomNav safely.
    content = content.replace('      <ConfirmDialog', '      </div>\n      <BottomNav role="guru" />\n      <ConfirmDialog')
    
    with open(f, "w") as file:
        file.write(content)

if __name__ == "__main__":
    fix_guru_again()
