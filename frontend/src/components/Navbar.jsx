import ProfileDropdown from "./ProfileDropdown";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar({ user, showBackButton = false, backTo = -1 }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || null);

  useEffect(() => {
    if (user) {
      setProfile(user);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:3000/api/auth/profile", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) setProfile(data.user || data);
      })
      .catch((err) => {
        console.log("Gagal ambil profile navbar:", err);
      });
  }, [user]);

  const handleBack = () => {
    if (typeof backTo === "number") {
      navigate(backTo);
    } else {
      navigate(backTo);
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b">

      {/* WRAPPER AGAR LEBAR SAMA DENGAN KONTEN */}
      <div className="w-full max-w-md md:max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* LEFT */}
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              type="button"
              onClick={handleBack}
              className="w-9 h-9 rounded-xl border bg-white flex items-center justify-center hover:bg-gray-50"
              aria-label="Kembali"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <h1 className="font-bold text-green-600 text-lg">
            Sora Kaili
          </h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-sm">
            {profile?.name}
          </span>
          <ProfileDropdown user={profile} />
        </div>

      </div>
    </div>
  );
}

export default Navbar;
