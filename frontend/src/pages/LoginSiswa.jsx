import { FaRocket } from "react-icons/fa";
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
      <div className="mb-6 flex rounded-full bg-sora/5 p-1 border border-sora/10">
        <button className="flex-1 rounded-full bg-white py-2 text-sm font-bold text-sora shadow-sm">
          Siswa
        </button>
        <button
          type="button"
          onClick={() => navigate("/login/guru")}
          className="flex-1 rounded-full py-2 text-sm font-bold text-sora/50 hover:text-sora transition-colors"
        >
          Guru
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-black text-sora">Login Siswa</h2>
        <p className="mt-2 text-sm text-sora/60 font-medium">Masukkan info akunmu.</p>
      </div>

      <div className="mt-5 flex rounded-2xl bg-cream/80 p-1 border border-sora/5 shadow-inner">
        <button className="flex-1 rounded-xl bg-white py-2 text-sm font-bold text-sora shadow-soft-sora">
          Masuk
        </button>
        <button
          type="button"
          onClick={() => navigate("/register/siswa")}
          className="flex-1 rounded-xl py-2 text-sm font-bold text-sora/50 hover:text-sora transition-colors"
        >
          Daftar
        </button>
      </div>

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-sora">Username</label>
          <input
            type="text"
            placeholder="Masukkan username"
            className="w-full rounded-2xl border-2 border-sora/10 bg-white px-4 py-3 outline-none transition-all focus:border-kaili focus:ring-4 focus:ring-kaili/20 font-medium placeholder:text-sora/30"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-sora">Kata Sandi</label>
          <input
            type="password"
            placeholder="Masukkan kata sandi"
            className="w-full rounded-2xl border-2 border-sora/10 bg-white px-4 py-3 outline-none transition-all focus:border-kaili focus:ring-4 focus:ring-kaili/20 font-medium placeholder:text-sora/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full rounded-2xl bg-sora p-4 font-black text-white shadow-soft-sora transition-all hover:-translate-y-1 hover:shadow-lg btn-bouncy text-lg mt-4">
          <span className="inline-flex items-center justify-center gap-2">Masuk Sekarang <FaRocket /></span>
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-kaili/30 bg-kaili/10 p-4 text-sm font-medium text-sora text-center">
        Belum punya akun? <span className="font-bold">Daftar dulu</span> untuk mulai belajar.
      </div>

    </AuthPageShell>
  );
}

export default LoginSiswa;
