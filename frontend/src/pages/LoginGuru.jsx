import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginGuru() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("guru");

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
          role: "guru",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Login guru berhasil");
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
          <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl shadow">
            👨‍🏫
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl md:text-2xl font-bold text-blue-600">
          Login Guru
        </h2>

        <p className="text-center text-gray-500 text-sm mb-4">
          Masuk dengan akun gurumu
        </p>
        
       {/* TAB */}
        <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
          <button
            className="flex-1 py-2 rounded-xl bg-white shadow text-sm font-semibold"
          >
            Masuk
          </button>
          <button onClick={() => navigate("/register/guru")}
            className="flex-1 py-2 rounded-xl text-sm">
            Daftar
          </button>
        </div>


        {/* Role Switch */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => navigate("/login/siswa")}
            className="flex-1 p-3 rounded-xl border bg-gray-100"
          >
            👨‍🎓 Siswa
          </button>

          <button
            onClick={() => setRole("guru")}
            className="flex-1 p-3 rounded-xl border bg-blue-100 border-blue-500"
          >
            👨‍🏫 Guru
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin}>
          <label className="text-sm text-gray-600">Username</label>
          <input
            type="text"
            placeholder="guru@sekolah.sch.id"
            className="w-full p-3 rounded-xl bg-gray-100 mb-3 focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="text-sm text-gray-600">Kata Sandi</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full p-3 rounded-xl border border-blue-500 bg-blue-50 mb-4 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* BUTTON */}
          <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Masuk sebagai Guru 👨‍🏫
          </button>
        </form>

        {/* LUPA PASSWORD */}
        <p className="text-center text-sm mt-3 text-blue-600 cursor-pointer">
          Lupa Kata Sandi?
        </p>

        {/* ALERT BOX */}
        <div className="bg-blue-100 text-blue-700 text-sm p-3 rounded-xl mt-4">
          🏫 Guru baru? Daftar untuk membuat akun host kuis.
        </div>

        {/* REGISTER LINK */}
        <p className="text-center text-sm mt-3 text-gray-500">
          Belum punya akun?{" "}
          <span
            onClick={() => navigate("/register/guru")}
            className="text-blue-600 cursor-pointer"
          >
            Daftar di sini
          </span>
        </p>

      </div>
    </div>
  );
}

export default LoginGuru;