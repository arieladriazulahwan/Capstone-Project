import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function RegisterGuru() {
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
          role: "guru",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Register guru berhasil");
        navigate("/login/guru");
      } else {
        alert(data.message);
      }
    } catch {
      alert("Terjadi kesalahan koneksi");
    }
  };

  return (
    <AuthPageShell
      tone="blue"
      title="Buat ruang belajar"
      subtitle="Daftar sebagai guru untuk membuat room, mengatur soal, dan melihat nilai siswa."
    >
      <div className="text-center">
        <h2 className="text-2xl font-black text-blue-600">Buat Akun Guru</h2>
        <p className="mt-2 text-sm text-gray-500">Kelola kelas dan kuis dengan mudah.</p>
      </div>

      <div className="mt-5 flex rounded-2xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => navigate("/login/guru")}
          className="flex-1 rounded-xl py-2 text-sm font-semibold text-gray-500"
        >
          Masuk
        </button>
        <button className="flex-1 rounded-xl bg-white py-2 text-sm font-bold text-gray-800 shadow">
          Daftar
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => navigate("/register/siswa")}
          className="rounded-2xl border border-gray-200 bg-white p-3 text-sm font-semibold text-gray-500 hover:bg-green-50"
        >
          Siswa
        </button>
        <button className="rounded-2xl border border-blue-300 bg-blue-50 p-3 text-sm font-bold text-blue-700">
          Guru
        </button>
      </div>

      <form onSubmit={handleRegister} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-600">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Masukkan nama lengkap"
            className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-600">Username</label>
          <input
            type="text"
            placeholder="Masukkan username"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-600">Kata Sandi</label>
          <input
            type="password"
            placeholder="Minimal 6 karakter"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full rounded-2xl bg-blue-600 p-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
          Buat Akun Guru
        </button>
      </form>

      <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
        Akun guru digunakan untuk membuat kuis dan mengelola siswa.
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={() => navigate("/login/guru")}
          className="font-bold text-blue-600"
        >
          Masuk
        </button>
      </p>
    </AuthPageShell>
  );
}

export default RegisterGuru;
