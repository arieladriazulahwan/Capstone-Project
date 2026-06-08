import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' or 'register'

  return (
    <AuthPageShell
      title={mode === "login" ? "Masuk ke Sora Kaili" : "Daftar Akun Baru"}
      subtitle={
        mode === "login"
          ? "Pilih peranmu untuk melanjutkan belajar, membuat room, atau mengelola kelas."
          : "Pilih peranmu untuk mulai mendaftar dan bergabung bersama kami."
      }
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-sora mb-2">Pilih Akses</h2>
        <p className="text-sora/60 font-medium">Tentukan peran Anda untuk masuk ke sistem.</p>
      </div>

      <div className="mb-8 flex rounded-2xl bg-cream/80 p-1 border border-sora/5 shadow-inner">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
            mode === "login" ? "bg-white text-sora shadow-soft-sora" : "text-sora/50 hover:text-sora"
          }`}
        >
          Masuk
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
            mode === "register" ? "bg-white text-sora shadow-soft-sora" : "text-sora/50 hover:text-sora"
          }`}
        >
          Daftar
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {/* Siswa Card */}
        <button
          type="button"
          onClick={() => navigate(mode === "login" ? "/login/siswa" : "/register/siswa")}
          className="group relative overflow-hidden rounded-[2rem] border-2 border-transparent bg-white p-6 text-left shadow-soft-sora transition-all hover:border-kaili hover:bg-cream hover:shadow-xl btn-bouncy w-full"
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-sora/5 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative flex items-center gap-6">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sora text-3xl font-black text-cream shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              S
            </span>
            <div className="flex-1">
              <p className="text-xl font-black text-sora mb-1">
                {mode === "login" ? "Masuk sebagai Siswa" : "Daftar sebagai Siswa"}
              </p>
              <p className="text-sm text-sora/70 font-medium">
                {mode === "login"
                  ? "Belajar materi, latihan, kuis, dan kumpulkan XP."
                  : "Buat akun untuk mulai belajar dan kumpulkan XP."}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sora/10 text-sora transition-all duration-300 group-hover:translate-x-1 group-hover:bg-sora group-hover:text-cream">
              →
            </div>
          </div>
        </button>

        {/* Guru Card */}
        <button
          type="button"
          onClick={() => navigate(mode === "login" ? "/login/guru" : "/register/guru")}
          className="group relative overflow-hidden rounded-[2rem] border-2 border-transparent bg-white p-6 text-left shadow-soft-sora transition-all hover:border-kaili hover:bg-cream hover:shadow-xl btn-bouncy w-full"
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-kaili/10 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative flex items-center gap-6">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-kaili text-3xl font-black text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              G
            </span>
            <div className="flex-1">
              <p className="text-xl font-black text-sora mb-1">
                {mode === "login" ? "Masuk sebagai Guru" : "Daftar sebagai Guru"}
              </p>
              <p className="text-sm text-sora/70 font-medium">
                {mode === "login"
                  ? "Buat room, kelola soal, dan pantau jawaban siswa."
                  : "Buat akun guru untuk mengelola room dan soal."}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kaili/10 text-kaili transition-all duration-300 group-hover:translate-x-1 group-hover:bg-kaili group-hover:text-white">
              →
            </div>
          </div>
        </button>
      </div>

    </AuthPageShell>
  );
}

export default Login;
