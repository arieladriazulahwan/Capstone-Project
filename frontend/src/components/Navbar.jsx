import ProfileDropdown from "./ProfileDropdown";

function Navbar({ user }) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b">

      {/* WRAPPER AGAR LEBAR SAMA DENGAN KONTEN */}
      <div className="w-full max-w-md md:max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* LEFT */}
        <div className="flex items-center gap-2">

          <h1 className="font-bold text-green-600 text-lg">
            Sora Kaili
          </h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-sm">
            {user?.name}
          </span>
          <ProfileDropdown user={user} />
        </div>

      </div>
    </div>
  );
}

export default Navbar;