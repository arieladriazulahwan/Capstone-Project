import ProfileDropdown from "./ProfileDropdown";
import { FiArrowLeft } from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SoraKailiLogo from "./SoraKailiLogo";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Navbar({ user, showBackButton = false, backTo = -1, role = "siswa" }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || null);

  useEffect(() => {
    if (user) {
      setProfile(user);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE_URL}/api/auth/profile`, {
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
    <div className="sticky top-4 md:top-6 z-40 mx-4 md:mx-8 bg-white/70 backdrop-blur-xl border border-white/60 shadow-soft-sora rounded-full px-4 py-2 mb-8 flex justify-between items-center transition-all duration-300">

      {/* LEFT */}
      <div className="flex items-center gap-2">
        {showBackButton && (
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sora shadow-soft-sora btn-bouncy"
            aria-label="Kembali"
          >
            <FiArrowLeft size={20} strokeWidth={2.5} />
          </button>
        )}

        <div className="md:hidden">
          {/* On mobile, Sidebar is hidden, so we show the logo here */}
          <SoraKailiLogo
            className={`w-28 h-10 overflow-hidden ${showBackButton ? "" : "-ml-1"}`}
            imgClassName="scale-[2] origin-center -translate-x-2"
          />
        </div>
        <div className="hidden md:flex items-center gap-2 pl-2">
           {/* On desktop, Sidebar already has the logo, so we can just show a page indicator or leave it clean */}
           <span className="font-bold text-sora/40 text-sm uppercase tracking-widest">
             {role === "admin" ? "Admin Panel" : role === "guru" ? "Panel Guru" : "Sora Kaili"}
           </span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end mr-1">
          <span className="text-sm font-black text-sora leading-tight">
            {profile?.name}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${role === 'admin' ? 'text-red-500' : role === 'guru' ? 'text-blue-500' : 'text-kaili'}`}>
            {role}
          </span>
        </div>
        <ProfileDropdown user={profile} />
      </div>

    </div>
  );
}

export default Navbar;
