import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import hideSidebarIcon from "../assets/hide-sidebar.svg";
import iconhome from "../assets/homelogo.svg";
import icongame from "../assets/gamelogo.svg";
import icontranslate from "../assets/translatelogo.svg";

function Sidebar({ role = "siswa" }) {
  // Baca state awal dari localStorage, atau default ke `false` (terbuka)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const navigate = useNavigate();
  const location = useLocation(); // 🔥 ambil route aktif

  // Simpan state ke localStorage setiap kali `collapsed` berubah
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed]);

  const menu =
    role === "guru"
      ? [
          {
            name: "Dashboard",
            icon: "🏠",
            path: "/dashboard/guru",
          },
          {
            name: "Room",
            icon: "🎯",
            path: "/guru/buat-room",
          },
        ]
      : [
          {
            name: "Dashboard",
            icon:  <img
            src={iconhome}
            alt="Dashboard"
            className="w-6 h-6"
            />,
            path: "/dashboard",
          },
          {
            name: "Level",
            icon: <img
            src={icongame}
            alt="Level"
            className="w-6 h-6"
            />,
            path: "/level",
          },
          {
            name: "Kamus",
            icon: <img
            src={icontranslate}
            alt="Kamus"
            className="w-6 h-6"/>,
            path: "/kamus",
          },
        ];

        const isGuru = role === "guru";

      const activeClass = isGuru
        ? "bg-blue-100 text-blue-600 font-semibold"
        : "bg-green-100 text-green-600 font-semibold";

      const hoverClass = isGuru
        ? "hover:bg-blue-50 text-gray-700"
        : "hover:bg-gray-100 text-gray-700";

      const titleClass = isGuru
        ? "text-blue-600"
        : "text-green-600";

  // Don't render Sidebar for guru role
  if (role === "guru") {
    return null;
  }

  return (
    <div
      className={`hidden md:flex flex-col bg-white shadow-lg transition-all duration-300 sticky top-0 h-screen z-50 ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      {/* LOGO + TOGGLE */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-100 transition"
      >
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src={hideSidebarIcon}
            alt="Sembunyikan sidebar"
            className="w-5 h-5 object-contain"
          />
        </div>

        {!collapsed && (
          <h1 className={`font-bold ${titleClass} text-lg`}>
            Sora Kaili
          </h1>
        )}
      </div>

      {/* WRAPPER FOR MENU */}
      <div className="flex-1">
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
                        ? activeClass
                        : hoverClass
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
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
