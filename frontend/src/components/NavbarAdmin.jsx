import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";

function NavbarAdmin({ user }) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
      <div className="w-full px-4 md:px-6 py-3 flex justify-between items-center">
        {/* LEFT — Mobile Logo */}
        <div className="flex items-center gap-3 md:hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">
            🛡️
          </div>
          <h1 className="font-bold text-purple-700 text-base">Admin</h1>
        </div>

        {/* LEFT — Desktop page title */}
        <div className="hidden md:block">
          <span className="text-sm text-gray-500">Panel Admin</span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-700">
              {user?.name}
            </span>
            <span className="text-xs text-purple-500 font-medium">Admin</span>
          </div>
          <ProfileDropdown user={user} />
        </div>
      </div>
    </div>
  );
}

export default NavbarAdmin;
