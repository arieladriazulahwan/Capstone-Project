import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import SoraKailiLogo from "./SoraKailiLogo";

function NavbarGuru({ user, showBackButton = false }) {
  const navigate = useNavigate();
  return (
    <div className="teacher-navbar sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur-xl">

      {/* WRAPPER */}
      <div className="w-full max-w-md md:max-w-4xl mx-auto px-4 py-2 flex justify-between items-center">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* BACK BUTTON */}
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition hover:-translate-y-0.5"
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
          <SoraKailiLogo
            className={`w-30 h-20 overflow-hidden ${showBackButton ? "" : "-ml-1"}`}
            imgClassName="scale-[1.7] -translate-x-1 translate-y-2"
          />

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
