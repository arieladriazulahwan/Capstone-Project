import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";

function NavbarGuru({ user, showBackButton = false }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40 bg-white border-b">

      {/* WRAPPER */}
      <div className="w-full max-w-md md:max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* BACK BUTTON */}
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* LOGO */}
          <div>
            <h1 className="font-bold text-blue-600 text-lg leading-none">
              Sora Kaili
            </h1>
          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* INFO USER */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-700">
              {user?.name}
            </span>
          </div>

          {/* PROFILE */}
          <ProfileDropdown user={user} />

        </div>

      </div>
    </div>
  );
}

export default NavbarGuru;