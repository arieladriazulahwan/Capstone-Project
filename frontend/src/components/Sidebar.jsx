import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen p-5">

      {/* LOGO */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
          🌿
        </div>
        <h1 className="font-bold text-green-600 text-lg">Sora Kaili</h1>
      </div>

      {/* MENU */}
      <div className="flex flex-col gap-3">

        <button
          onClick={() => navigate("/dashboard")}
          className="text-left p-3 rounded-xl bg-green-100 text-green-600 font-medium"
        >
          🏠 Home
        </button>

        <button className="text-left p-3 rounded-xl hover:bg-gray-100">
          📖 Kosakata
        </button>

        <button className="text-left p-3 rounded-xl hover:bg-gray-100">
          📊 Riwayat
        </button>

      </div>

      {/* LOGOUT */}
      <div className="mt-auto">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="w-full p-3 rounded-xl bg-red-100 text-red-500"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}

export default Sidebar;