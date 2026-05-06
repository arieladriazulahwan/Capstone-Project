import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // 🔥 ambil route aktif

  const menu = [
    { name: "Home", icon: "🏠", path: "/dashboard" },
    { name: "Level", icon: "⭐", path: "/level" },
    { name: "Kamus", icon: "📚", path: "/kamus" },
    { name: "Riwayat", icon: "📜", path: "/riwayat" },
  ];

  return (
    <div
      className={`hidden md:flex flex-col bg-white shadow-lg transition-all duration-300 ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      {/* LOGO + TOGGLE */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-100"
      >
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
          🌿
        </div>

        {!collapsed && (
          <h1 className="font-bold text-green-600 text-lg">
            Sora Kaili
          </h1>
        )}
      </div>

      {/* MENU */}
      <div className="flex flex-col gap-2 mt-4">
        {menu.map((item, i) => {
          const isActive = location.pathname === item.path;

          return (
            <div key={i} className="relative group">
              <div
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer transition
                  ${
                    isActive
                      ? "bg-green-100 text-green-600 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>

                {!collapsed && (
                  <span className="text-sm">{item.name}</span>
                )}
              </div>

              {/* TOOLTIP saat collapse */}
              {collapsed && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;