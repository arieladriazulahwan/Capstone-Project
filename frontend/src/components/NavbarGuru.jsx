import ProfileDropdown from "./ProfileDropdown";

function NavbarGuru({ user }) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b">

      {/* WRAPPER */}
      <div className="w-full max-w-md md:max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* LEFT */}
        <div className="flex items-center gap-3">

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