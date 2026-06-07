import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const roleHome = {
  siswa: "/dashboard",
  guru: "/dashboard/guru",
  admin: "/dashboard/admin",
};

const roleLogin = {
  siswa: "/login/siswa",
  guru: "/login/guru",
  admin: "/login/admin",
};

function ProtectedRoute({ children, allowedRole }) {
  const location = useLocation();
  const [status, setStatus] = useState("checking");
  const [redirectTo, setRedirectTo] = useState("");

  useEffect(() => {
    let ignore = false;

    const checkAccess = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!ignore) {
          setRedirectTo(roleLogin[allowedRole] || "/login");
          setStatus("redirect");
        }
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          if (!ignore) {
            setRedirectTo(roleLogin[allowedRole] || "/login");
            setStatus("redirect");
          }
          return;
        }

        const data = await res.json();
        const currentUser = data.user || data;

        if (currentUser.role !== allowedRole) {
          if (!ignore) {
            setRedirectTo(roleHome[currentUser.role] || "/login");
            setStatus("redirect");
          }
          return;
        }

        if (!ignore) {
          setStatus("allowed");
        }
      } catch {
        localStorage.removeItem("token");
        if (!ignore) {
          setRedirectTo(roleLogin[allowedRole] || "/login");
          setStatus("redirect");
        }
      }
    };

    checkAccess();

    return () => {
      ignore = true;
    };
  }, [allowedRole]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/80">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-[3px] border-green-200 border-t-green-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium animate-pulse">
            Memeriksa akses...
          </p>
        </div>
      </div>
    );
  }

  if (status === "redirect") {
    return <Navigate to={redirectTo || "/login"} replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
