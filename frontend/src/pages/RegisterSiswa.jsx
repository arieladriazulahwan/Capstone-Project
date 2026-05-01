import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterSiswa() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("siswa");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          password,
          role: "siswa",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Register berhasil");
        navigate("/login/siswa");
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
            🌿
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl md:text-2xl font-bold text-green-600">
          Buat Akun Siswa
        </h2>

        <p className="text-center text-gray-500 text-sm mb-4">
          Daftar gratis, belajar kapan saja!
        </p>

        {/* TAB */}
        <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => navigate("/login/siswa")}
            className="flex-1 py-2 rounded-xl text-sm"
          >
            Masuk
          </button>
          <button className="flex-1 py-2 rounded-xl bg-white shadow text-sm font-semibold">
            Daftar
          </button>
        </div>

        {/* ROLE */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setRole("siswa")}
            className="flex-1 p-3 rounded-xl border bg-green-100 border-green-500"
          >
            👨‍🎓 Siswa
          </button>

          <button
            onClick={() => navigate("/register/guru")}
            className="flex-1 p-3 rounded-xl border bg-gray-100"
          >
            👨‍🏫 Guru
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleRegister}>
          <label className="text-sm text-gray-600">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Budi Santoso"
            className="w-full p-3 rounded-xl border border-green-500 bg-green-50 mb-3 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="text-sm text-gray-600">Username</label>
          <input
            type="text"
            placeholder="budi_santoso"
            className="w-full p-3 rounded-xl bg-gray-100 mb-3 focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="text-sm text-gray-600">
            Kata Sandi (min. 6 karakter)
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full p-3 rounded-xl bg-gray-100 mb-4 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* BUTTON */}
          <button className="w-full bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700 transition">
            Buat Akun ✨
          </button>
        </form>

        {/* LOGIN LINK */}
        <p className="text-center text-sm mt-4 text-gray-500">
          Sudah punya akun?{" "}
          <span
            onClick={() => navigate("/login/siswa")}
            className="text-green-600 cursor-pointer"
          >
            Masuk
          </span>
        </p>

      </div>
    </div>
  );
}

export default RegisterSiswa;