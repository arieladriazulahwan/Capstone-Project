import { useLocation, useNavigate } from "react-router-dom";
import { FiBarChart2, FiBookOpen, FiFileText, FiHome, FiStar, FiUsers } from "react-icons/fi";

function BottomNav({ role = "siswa" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuSiswa = [
    { name: "Dashboard", icon: FiHome, path: "/dashboard" },
    { name: "Level", icon: FiStar, path: "/level" },
    { name: "Kamus", icon: FiBookOpen, path: "/kamus" },
  ];

  const menuGuru = [
    { name: "Dashboard", icon: FiHome, path: "/dashboard/guru" },
  ];

  const menuAdmin = [
    { name: "Dashboard", icon: FiBarChart2, path: "/dashboard/admin" },
    { name: "Kamus", icon: FiBookOpen, path: "/admin/kamus" },
    { name: "Materi", icon: FiFileText, path: "/admin/materi" },
    { name: "User", icon: FiUsers, path: "/admin/users" },
    { name: "Room", icon: FiHome, path: "/admin/rooms" },
  ];

  const menu = role === "admin" ? menuAdmin : role === "guru" ? menuGuru : menuSiswa;

  // On Guru, maybe we don't even need a BottomNav if it's only 1 item, but let's keep it consistent.
  // Actually, if it's only 1 item, it looks weird. We'll render it anyway to keep consistency,
  // or maybe just a floating FAB. Let's just render it centered.
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-sora/10 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] pb-safe">
      <div className={`flex items-center justify-center gap-1 px-2 py-2 ${menu.length > 3 ? 'justify-between' : 'justify-around'}`}>
        {menu.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/dashboard" && item.path !== "/dashboard/admin" && item.path !== "/dashboard/guru");
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold transition-all duration-300 ${
                isActive
                  ? "text-kaili scale-110"
                  : "text-sora/40 hover:text-sora/80 hover:bg-cream/50"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
                  isActive ? "bg-kaili text-white shadow-glow-kaili" : "bg-transparent"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className="leading-none">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
