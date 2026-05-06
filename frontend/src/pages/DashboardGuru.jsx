import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";

function DashboardGuru() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 🔐 GET USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login/guru");
          return;
        }

        const res = await fetch("http://localhost:3000/api/auth/profile", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        const data = await res.json();

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login/guru");
          return;
        }

        setUser(data.user || data);
      } catch {
        alert("Gagal ambil data user");
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* SIDEBAR */}
        <Sidebar role="guru" />
        <BottomNav role="guru" />

      {/* MAIN */}
      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-md md:max-w-4xl">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-bold text-blue-600 text-xl">
              Dashboard Guru
            </h1>

            <div className="flex items-center gap-3">
              <span className="hidden md:block">
                {user?.name}
              </span>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                👨‍🏫
              </div>
            </div>
          </div>

          {/* GREETING */}
          <div className="bg-blue-500 text-white rounded-2xl p-5 mb-5">
            <h2 className="font-bold text-lg">
              Halo, {user?.name} 👋
            </h2>
            <p className="text-sm">
              Kelola pembelajaran Bahasa Kaili
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <h3 className="text-blue-600 text-xl font-bold">12</h3>
              <p className="text-sm">Soal</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow text-center">
              <h3 className="text-green-600 text-xl font-bold">3</h3>
              <p className="text-sm">Room Aktif</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow text-center">
              <h3 className="text-yellow-500 text-xl font-bold">45</h3>
              <p className="text-sm">Siswa</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow text-center">
              <h3 className="text-purple-600 text-xl font-bold">5</h3>
              <p className="text-sm">Kuis</p>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="grid grid-cols-2 gap-3 mb-5">

            <button
              onClick={() => navigate("/guru/buat-soal")}
              className="bg-blue-500 text-white p-4 rounded-xl font-semibold hover:bg-blue-600"
            >
              ➕ Buat Soal
            </button>

            <button
              onClick={() => navigate("/guru/buat-room")}
              className="bg-green-500 text-white p-4 rounded-xl font-semibold hover:bg-green-600"
            >
              🎯 Buat Room
            </button>

          </div>

          {/* LIST SOAL */}
          <div className="mb-5">
            <h3 className="font-semibold mb-3">📋 Daftar Soal</h3>

            <div className="flex flex-col gap-3">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white p-4 rounded-xl shadow flex justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      Soal #{item}
                    </p>
                    <p className="text-sm text-gray-500">
                      Pilihan ganda
                    </p>
                  </div>

                  <button className="text-blue-500">
                    Edit
                  </button>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>

      {/* MOBILE NAV */}
      <BottomNav role="guru" />
    </div>
  );
}

export default DashboardGuru;