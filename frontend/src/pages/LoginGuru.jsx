import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function LoginGuru() {
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
          role: "guru",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Login guru berhasil");
        navigate("/dashboard/guru");
      } else {
        alert(`Gagal: ${data.message}${data.error ? " | " + JSON.stringify(data.error) : ""}`);
      }
    } catch {
      alert("Terjadi kesalahan koneksi");
    }
  };

  return (
    <AuthPageShell
      tone="blue"
      title="Kelola kelas dengan mudah"
      subtitle="Masuk sebagai guru untuk membuat room, mengelola soal, dan melihat nilai siswa."
    >
      <div className="text-center">
        <h2 className="text-2xl font-black text-blue-600">Login Guru</h2>
        <p className="mt-2 text-sm text-gray-500">Masuk dengan akun gurumu.</p>
      </div>

      <div className="mt-5 flex rounded-2xl bg-gray-100 p-1">
        <button className="flex-1 rounded-xl bg-white py-2 text-sm font-bold text-gray-800 shadow">
          Masuk
        </button>
        <button
          type="button"
          onClick={() => navigate("/register/guru")}
          className="flex-1 rounded-xl py-2 text-sm font-semibold text-gray-500"
        >
          Daftar
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => navigate("/login/siswa")}
          className="rounded-2xl border border-gray-200 bg-white p-3 text-sm font-semibold text-gray-500 hover:bg-green-50"
        >
          Siswa
        </button>
        <button className="rounded-2xl border border-blue-300 bg-blue-50 p-3 text-sm font-bold text-blue-700">
          Guru
        </button>
      </div>

      <form onSubmit={handleLogin} className="mt-5 space-y-4">
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
            placeholder="Masukkan kata sandi"
            className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full rounded-2xl bg-blue-600 p-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
          Masuk sebagai Guru
        </button>
      </form>

      <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
        Akun guru digunakan untuk membuat room dan memantau jawaban siswa.
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={() => navigate("/register/guru")}
          className="font-bold text-blue-600"
        >
          Daftar di sini
        </button>
      </p>
    </AuthPageShell>
  );
}

export default LoginGuru;
