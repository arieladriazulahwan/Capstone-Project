import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginSiswa() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("siswa");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role: "siswa",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Login berhasil");
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch {
      alert("Terjadi kesalahan koneksi");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md md:max-w-lg bg-white rounded-3xl shadow-xl p-6 md:p-8">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl shadow">
            👨‍🎓
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl md:text-2xl font-bold text-green-600">
          Login Siswa
        </h2>

        <p className="text-center text-gray-500 text-sm mb-4">
          Masukkan info akunmu
        </p>

             {/* TAB */}
        <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
          <button
            className="flex-1 py-2 rounded-xl bg-white shadow text-sm font-semibold"
          >
            Masuk
          </button>
          <button onClick={() => navigate("/register/siswa")}
            className="flex-1 py-2 rounded-xl text-sm">
            Daftar
          </button>
        </div>


        {/* Role Switch */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setRole("siswa")}
            className={`flex-1 p-3 rounded-xl border ${
              role === "siswa"
                ? "bg-green-100 border-green-500"
                : "bg-gray-100"
            }`}
          >
            👨‍🎓 Siswa
          </button>

          <button
            onClick={() => navigate("/login/guru")}
            className="flex-1 p-3 rounded-xl border bg-gray-100"
          >
            👨‍🏫 Guru
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin}>
          <label className="text-sm text-gray-600">Username</label>
          <input
            type="text"
            placeholder="nama_pengguna"
            className="w-full p-3 rounded-xl bg-green-50 border border-green-500 mb-3 focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="text-sm text-gray-600">Kata Sandi</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full p-3 rounded-xl bg-gray-100 mb-4 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* BUTTON */}
          <button className="w-full bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700 transition">
            Masuk Sekarang 🚀
          </button>
        </form>

        {/* LUPA PASSWORD */}
        <p className="text-center text-sm mt-3 text-green-600 cursor-pointer">
          Lupa Kata Sandi?
        </p>

        {/* ALERT BOX */}
        <div className="bg-yellow-100 text-yellow-700 text-sm p-3 rounded-xl mt-4">
          ⚠️ Belum punya akun? Klik "Daftar di sini" untuk membuat akun baru!
        </div>

        {/* REGISTER LINK */}
        <p className="text-center text-sm mt-3 text-gray-500">
          Belum punya akun?{" "}
          <span
            onClick={() => navigate("/register/siswa")}
            className="text-green-600 cursor-pointer"
          >
            Daftar di sini
          </span>
        </p>

      </div>
    </div>
  );
}

export default LoginSiswa;