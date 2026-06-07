import { useNavigate } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell";

function Login() {
  const navigate = useNavigate();

  return (
    <AuthPageShell
      title="Masuk ke Sora Kaili"
      subtitle="Pilih peranmu untuk melanjutkan belajar, membuat room, atau mengelola kelas."
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-sora mb-2">Pilih Akses</h2>
        <p className="text-sora/60 font-medium">Tentukan peran Anda untuk masuk ke sistem.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Siswa Card */}
        <button
          type="button"
          onClick={() => navigate("/login/siswa")}
          className="group relative overflow-hidden rounded-[2rem] border-2 border-transparent bg-white p-6 text-left shadow-soft-sora transition-all hover:border-kaili hover:bg-cream hover:shadow-xl btn-bouncy w-full"
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-sora/5 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative flex items-center gap-6">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sora text-3xl font-black text-cream shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              S
            </span>
            <div className="flex-1">
              <p className="text-xl font-black text-sora mb-1">Masuk sebagai Siswa</p>
              <p className="text-sm text-sora/70 font-medium">Belajar materi, latihan, kuis, dan kumpulkan XP.</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sora/10 text-sora transition-all duration-300 group-hover:translate-x-1 group-hover:bg-sora group-hover:text-cream">
              →
            </div>
          </div>
        </button>

        {/* Guru Card */}
        <button
          type="button"
          onClick={() => navigate("/login/guru")}
          className="group relative overflow-hidden rounded-[2rem] border-2 border-transparent bg-white p-6 text-left shadow-soft-sora transition-all hover:border-kaili hover:bg-cream hover:shadow-xl btn-bouncy w-full"
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-kaili/10 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative flex items-center gap-6">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-kaili text-3xl font-black text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              G
            </span>
            <div className="flex-1">
              <p className="text-xl font-black text-sora mb-1">Masuk sebagai Guru</p>
              <p className="text-sm text-sora/70 font-medium">Buat room, kelola soal, dan pantau jawaban siswa.</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kaili/10 text-kaili transition-all duration-300 group-hover:translate-x-1 group-hover:bg-kaili group-hover:text-white">
              →
            </div>
          </div>
        </button>

        {/* Admin Card */}
        <button
          type="button"
          onClick={() => navigate("/login/admin")}
          className="group relative overflow-hidden rounded-[2rem] border-2 border-transparent bg-white p-6 text-left shadow-soft-sora transition-all hover:border-purple-400 hover:bg-purple-50 hover:shadow-xl btn-bouncy w-full"
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-purple-500/10 transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative flex items-center gap-6">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-3xl font-black text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              A
            </span>
            <div className="flex-1">
              <p className="text-xl font-black text-sora mb-1">Admin Panel</p>
              <p className="text-sm text-sora/70 font-medium">Kelola sistem, pengguna, dan data master Sora Kaili.</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-purple-600 group-hover:text-white">
              →
            </div>
          </div>
        </button>
      </div>

    </AuthPageShell>
  );
}

export default Login;
