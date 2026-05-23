import { useNavigate } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell";

function Login() {
  const navigate = useNavigate();

  return (
    <AuthPageShell
      title="Masuk ke Sora Kaili"
      subtitle="Pilih peranmu untuk melanjutkan belajar, membuat room, atau mengelola kelas."
    >
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900">Pilih Akses</h2>
        <p className="mt-2 text-sm text-gray-500">Masuk sebagai siswa atau guru.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate("/login/siswa")}
          className="group rounded-3xl border border-green-100 bg-green-50 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-xl"
        >
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-lg font-black text-white transition group-hover:scale-110">
            S
          </span>
          <p className="text-lg font-black text-gray-900">Siswa</p>
          <p className="mt-1 text-sm text-gray-500">Belajar materi, latihan, kuis, dan kumpulkan XP.</p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/login/guru")}
          className="group rounded-3xl border border-blue-100 bg-blue-50 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
        >
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white transition group-hover:scale-110">
            G
          </span>
          <p className="text-lg font-black text-gray-900">Guru</p>
          <p className="mt-1 text-sm text-gray-500">Buat room, kelola soal, dan pantau jawaban siswa.</p>
        </button>
      </div>

      <p className="mt-7 text-center text-sm text-gray-500">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="font-bold text-green-600 hover:text-green-700"
        >
          Daftar di sini
        </button>
      </p>
    </AuthPageShell>
  );
}

export default Login;
