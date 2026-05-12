import { useEffect, useState } from "react";
import NavbarGuru from "../components/NavbarGuru";
import RoomCard from "../components/RoomCard";
import { useNavigate } from "react-router-dom";

function DashboardGuru() {

  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);

  const navigate = useNavigate();

  // ========================================
  // 🔐 GET USER
  // ========================================

  useEffect(() => {

    const fetchUser = async () => {

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:3000/api/auth/profile",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        console.error("Failed to fetch user:", res.status);
        // Handle error, perhaps redirect to login
      }

    };

    fetchUser();

  }, []);

  // ========================================
  // 📥 GET ROOM
  // ========================================

  useEffect(() => {

    const fetchRooms = async () => {

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:3000/api/rooms",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      } else {
        console.error("Failed to fetch rooms:", res.status);
        setRooms([]);
      }

    };

    fetchRooms();

  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <NavbarGuru user={user} />

      <main className="px-4 py-6 flex justify-center">

        <div className="w-full max-w-md md:max-w-4xl">

            {/* GREETING */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-2xl p-5 mb-5 shadow">
              <h2 className="font-bold text-lg">
                Selamat datang, {user.name} 👋
              </h2>

              <p className="text-sm">
                Buat room kuis dan bagikan kode ke siswa
              </p>
            </div>

            {/* BUTTON */}
            <button
              onClick={() => navigate("/guru/buat-room")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-4 shadow font-bold mb-5"
            >
              ＋ Buat Room Kuis Baru
            </button>

            {/* ROOM LIST */}
            <div>

              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">
                  🏠 Room Kuis Saya
                </h3>

                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {rooms.length} room
                </span>
              </div>

              <div className="flex flex-col gap-3">

                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}

              </div>

            </div>

          </div>

        </main>

    </div>
  );
}

export default DashboardGuru;