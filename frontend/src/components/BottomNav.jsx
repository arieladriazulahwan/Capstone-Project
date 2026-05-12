import { useNavigate, useLocation } from "react-router-dom";

function BottomNav({ role = "siswa" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuSiswa = [
    { label: "Home", path: "/dashboard", icon: "🏠" },
    { label: "Level", path: "/level", icon: "⭐" },
    { label: "Kamus", path: "/kamus", icon: "📚" },
  ];

  const menuGuru = [
    { label: "Home", path: "/dashboard/guru", icon: "🏠" },
    { label: "Buat Room", path: "/guru/buat-room", icon: "🎯" },
  ];

  const menu = role === "guru" ? menuGuru : menuSiswa;

  // Don't render BottomNav for guru role
  if (role === "guru") {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow md:hidden flex justify-around py-2">
      {menu.map((item, i) => (
        <button
          key={i}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center text-sm ${
            location.pathname === item.path
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default BottomNav;