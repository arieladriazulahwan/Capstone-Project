import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function RegisterSiswa() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
    <AuthPageShell
      title="Mulai perjalanan belajar"
      subtitle="Daftar sebagai siswa untuk mengakses materi, latihan, kuis, XP, dan streak harian."
    >
      <div className="text-center">
        <h2 className="text-2xl font-black text-green-600">Buat Akun Siswa</h2>
        <p className="mt-2 text-sm text-gray-500">Daftar gratis, belajar kapan saja.</p>
      </div>

      <div className="mt-5 flex rounded-2xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => navigate("/login/siswa")}
          className="flex-1 rounded-xl py-2 text-sm font-semibold text-gray-500"
        >
          Masuk
        </button>
        <button className="flex-1 rounded-xl bg-white py-2 text-sm font-bold text-gray-800 shadow">
          Daftar
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-2xl border border-green-300 bg-green-50 p-3 text-sm font-bold text-green-700">
          Siswa
        </button>
        <button
          type="button"
          onClick={() => navigate("/register/guru")}
          className="rounded-2xl border border-gray-200 bg-white p-3 text-sm font-semibold text-gray-500 hover:bg-blue-50"
        >
          Guru
        </button>
      </div>

      <form onSubmit={handleRegister} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-600">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Masukkan nama lengkap"
            className="w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-600">Username</label>
          <input
            type="text"
            placeholder="Masukkan username"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-600">Kata Sandi</label>
          <input
            type="password"
            placeholder="Minimal 6 karakter"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full rounded-2xl bg-green-600 p-3 font-bold text-white shadow-lg shadow-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-700">
          Buat Akun
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={() => navigate("/login/siswa")}
          className="font-bold text-green-600"
        >
          Masuk
        </button>
      </p>
    </AuthPageShell>
  );
}

export default RegisterSiswa;
