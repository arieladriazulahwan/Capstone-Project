import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiBarChart2, FiBookOpen, FiFileText, FiHome, FiShield, FiStar, FiUsers } from "react-icons/fi";
import hideSidebarIcon from "../assets/hide-sidebar.svg";

function Sidebar({ role = "siswa" }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed]);

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
    { name: "Materi & Kuis", icon: FiFileText, path: "/admin/materi" },
    { name: "Pengguna", icon: FiUsers, path: "/admin/users" },
    { name: "Room Kelas", icon: FiHome, path: "/admin/rooms" },
  ];

  const menu = role === "admin" ? menuAdmin : role === "guru" ? menuGuru : menuSiswa;

  const activeClass = "bg-kaili text-white font-bold shadow-glow-kaili";
  const hoverClass = "hover:bg-cream/80 text-sora/60 hover:text-sora transition-all btn-bouncy";
  const titleClass = "text-sora";

  return (
    <div
      className={`hidden md:flex shrink-0 flex-col bg-white/70 backdrop-blur-xl border-r border-white/60 shadow-soft-sora transition-all duration-300 h-screen z-50 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* LOGO + TOGGLE */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 p-5 cursor-pointer hover:bg-cream/50 transition-colors border-b border-sora/5"
      >
        <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-sora rounded-xl shadow-soft-sora">
          {role === "admin" ? (
            <FiShield className="text-white w-5 h-5" />
          ) : (
            <img
              src={hideSidebarIcon}
              alt="Sembunyikan sidebar"
              className="w-5 h-5 object-contain opacity-90 invert brightness-0"
            />
          )}
        </div>

        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className={`font-black ${titleClass} text-lg leading-tight`}>
              Sora Kaili
            </h1>
            {role === "admin" && (
              <span className="text-[10px] text-kaili font-bold uppercase tracking-wider">
                Admin Panel
              </span>
            )}
            {role === "guru" && (
              <span className="text-[10px] text-sora/60 font-bold uppercase tracking-wider">
                Panel Guru
              </span>
            )}
          </div>
        )}
      </div>

      {/* WRAPPER FOR MENU */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        <div className="flex flex-col gap-2">
          {menu.map((item, i) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/dashboard" && item.path !== "/dashboard/admin" && item.path !== "/dashboard/guru");
            const Icon = item.icon;

            return (
              <div key={i} className="relative group">
                <div
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 p-3 mx-4 rounded-2xl cursor-pointer transition-all duration-300
                    ${isActive ? activeClass : hoverClass}
                  `}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />

                  {!collapsed && (
                    <span className="text-sm truncate">{item.name}</span>
                  )}
                </div>

                {/* TOOLTIP saat collapse */}
                {collapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-sora text-cream text-xs px-2.5 py-1.5 font-bold rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none shadow-soft-sora">
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
