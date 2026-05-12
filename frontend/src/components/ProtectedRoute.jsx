import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const roleHome = {
  siswa: "/dashboard",
  guru: "/dashboard/guru",
};

const roleLogin = {
  siswa: "/login/siswa",
  guru: "/login/guru",
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
        const res = await fetch("http://localhost:3000/api/auth/profile", {
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

        const user = await res.json();

        if (user.role !== allowedRole) {
          if (!ignore) {
            setRedirectTo(roleHome[user.role] || "/login");
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
      <div className="min-h-screen flex items-center justify-center">
        Memeriksa akses...
      </div>
    );
  }

  if (status === "redirect") {
    return <Navigate to={redirectTo || "/login"} replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
