import { FaRocket } from "react-icons/fa";
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

    if (password.length < 4) {
      alert("Password minimal 4 karakter");
      return;
    }

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
      <div className="mb-6 flex rounded-full bg-sora/5 p-1 border border-sora/10">
        <button
          type="button"
          onClick={() => navigate("/register/siswa")}
          className="flex-1 rounded-full py-2 text-sm font-bold text-sora/50 hover:text-sora transition-colors"
        >
          Siswa
        </button>
        <button className="flex-1 rounded-full bg-white py-2 text-sm font-bold text-sora shadow-sm">
          Guru
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-black text-sora">Buat Akun Guru</h2>
        <p className="mt-2 text-sm text-sora/60 font-medium">Kelola kelas dan kuis dengan mudah.</p>
      </div>

      <div className="mt-5 flex rounded-2xl bg-cream/80 p-1 border border-sora/5 shadow-inner">
        <button
          type="button"
          onClick={() => navigate("/login/guru")}
          className="flex-1 rounded-xl py-2 text-sm font-bold text-sora/50 hover:text-sora transition-colors"
        >
          Masuk
        </button>
        <button className="flex-1 rounded-xl bg-white py-2 text-sm font-bold text-sora shadow-soft-sora">
          Daftar
        </button>
      </div>

      <form onSubmit={handleRegister} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-sora">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Masukkan nama lengkap"
            className="w-full rounded-2xl border-2 border-sora/10 bg-white px-4 py-3 outline-none transition-all focus:border-sora focus:ring-4 focus:ring-sora/20 font-medium placeholder:text-sora/30"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-sora">Username</label>
          <input
            type="text"
            placeholder="Masukkan username"
            className="w-full rounded-2xl border-2 border-sora/10 bg-white px-4 py-3 outline-none transition-all focus:border-sora focus:ring-4 focus:ring-sora/20 font-medium placeholder:text-sora/30"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-sora">Kata Sandi</label>
          <input
            type="password"
            placeholder="Minimal 4 karakter"
            className="w-full rounded-2xl border-2 border-sora/10 bg-white px-4 py-3 outline-none transition-all focus:border-sora focus:ring-4 focus:ring-sora/20 font-medium placeholder:text-sora/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full rounded-2xl bg-sora p-4 font-black text-white shadow-soft-sora transition-all hover:-translate-y-1 hover:shadow-lg btn-bouncy text-lg mt-4">
          <span className="inline-flex items-center justify-center gap-2">Buat Akun Guru <FaRocket /></span>
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-sora/20 bg-sora/5 p-4 text-sm font-medium text-sora text-center">
        Akun guru digunakan untuk <span className="font-bold">membuat kuis</span> dan mengelola siswa.
      </div>

    </AuthPageShell>
  );
}

export default RegisterGuru;
