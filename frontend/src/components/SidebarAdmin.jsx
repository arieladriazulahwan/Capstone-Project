import { useNavigate, useLocation } from "react-router-dom";

const menu = [
  { name: "Dashboard", icon: "📊", path: "/dashboard/admin" },
  { name: "Kamus", icon: "📚", path: "/admin/kamus" },
  { name: "Materi & Kuis", icon: "📖", path: "/admin/materi" },
  { name: "Pengguna", icon: "👥", path: "/admin/users" },
  { name: "Room Kelas", icon: "🏠", path: "/admin/rooms" },
];

function SidebarAdmin() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="admin-sidebar hidden md:flex flex-col shadow-lg w-60 min-h-screen">
      {/* LOGO */}
      <div
        onClick={() => navigate("/dashboard/admin")}
        className="flex items-center gap-2 p-4 cursor-pointer hover:bg-purple-50/80 border-b border-purple-100/70 transition"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg">
          🛡️
        </div>
        <div>
          <h1 className="font-bold text-purple-700 text-base leading-tight">
            Sora Kaili
          </h1>
          <span className="text-[10px] text-purple-400 font-medium">
            ADMIN PANEL
          </span>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-1 mt-3 px-2">
        {menu.map((item, i) => {
          const isActive = location.pathname === item.path;

          return (
            <div
              key={i}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
                ${
                isActive
                    ? "bg-purple-100 text-purple-700 font-semibold shadow-sm"
                    : "hover:bg-purple-50/80 text-gray-600"
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </div>
          );
        })}
      </nav>

      {/* BOTTOM */}
      <div className="mt-auto p-3 border-t border-purple-100/70">
        <div className="text-[10px] text-gray-400 text-center">
          Sora Kaili Admin v1.0
        </div>
      </div>
    </div>
  );
}

export default SidebarAdmin;
