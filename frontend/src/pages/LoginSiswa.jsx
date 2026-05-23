import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function LoginSiswa() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
        alert(`Gagal: ${data.message}${data.error ? " | " + JSON.stringify(data.error) : ""}`);
      }
    } catch {
      alert("Terjadi kesalahan koneksi");
    }
  };

  return (
    <AuthPageShell
      title="Selamat datang kembali"
      subtitle="Masuk sebagai siswa untuk melanjutkan level, menjaga streak, dan mengerjakan kuis."
    >
      <div className="text-center">
        <h2 className="text-2xl font-black text-green-600">Login Siswa</h2>
        <p className="mt-2 text-sm text-gray-500">Masukkan info akunmu.</p>
      </div>

      <div className="mt-5 flex rounded-2xl bg-gray-100 p-1">
        <button className="flex-1 rounded-xl bg-white py-2 text-sm font-bold text-gray-800 shadow">
          Masuk
        </button>
        <button
          type="button"
          onClick={() => navigate("/register/siswa")}
          className="flex-1 rounded-xl py-2 text-sm font-semibold text-gray-500"
        >
          Daftar
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-2xl border border-green-300 bg-green-50 p-3 text-sm font-bold text-green-700">
          Siswa
        </button>
        <button
          type="button"
          onClick={() => navigate("/login/guru")}
          className="rounded-2xl border border-gray-200 bg-white p-3 text-sm font-semibold text-gray-500 hover:bg-blue-50"
        >
          Guru
        </button>
      </div>

      <form onSubmit={handleLogin} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-600">Username</label>
          <input
            type="text"
            placeholder="Masukkan username"
            className="w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-600">Kata Sandi</label>
          <input
            type="password"
            placeholder="Masukkan kata sandi"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full rounded-2xl bg-green-600 p-3 font-bold text-white shadow-lg shadow-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-700">
          Masuk Sekarang
        </button>
      </form>

      <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
        Belum punya akun? Daftar dulu untuk mulai belajar.
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={() => navigate("/register/siswa")}
          className="font-bold text-green-600"
        >
          Daftar di sini
        </button>
      </p>
    </AuthPageShell>
  );
}

export default LoginSiswa;
