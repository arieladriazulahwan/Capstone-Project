import { useLocation, useNavigate } from "react-router-dom";

const menu = [
  { name: "Dashboard", icon: "D", path: "/dashboard/admin" },
  { name: "Kamus", icon: "K", path: "/admin/kamus" },
  { name: "Materi", icon: "M", path: "/admin/materi" },
  { name: "User", icon: "U", path: "/admin/users" },
  { name: "Room", icon: "R", path: "/admin/rooms" },
];

function BottomNavAdmin() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
      <div className="grid grid-cols-5 px-2 py-2">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                  isActive ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.icon}
              </span>
              <span className="leading-none">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavAdmin;
