import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProfileDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // close jika klik luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* AVATAR */}
      <div
        onClick={() => setOpen(!open)}
        className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center cursor-pointer"
      >
        👨‍🎓
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-xl p-2 z-50">
          <p className="text-sm px-2 py-1 text-gray-600">
            {user?.name}
          </p>

          <button
            onClick={handleLogout}
            className="w-full text-left px-2 py-2 text-red-500 hover:bg-gray-100 rounded-lg"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;