import { useNavigate } from "react-router-dom";
import AuthPageShell from "../components/AuthPageShell";

function RegisterSelect() {
  const navigate = useNavigate();

  return (
    <AuthPageShell
      title="Pilih jenis akun"
      subtitle="Siswa belajar dengan level dan kuis. Guru membuat room dan memantau perkembangan kelas."
    >
      <div className="text-center">
        <h2 className="text-2xl font-black text-green-600">Daftar Akun</h2>
        <p className="mt-2 text-sm text-gray-500">Pilih peran yang ingin dibuat.</p>
      </div>

      <div className="mt-6 grid gap-4">
        <button
          type="button"
          onClick={() => navigate("/register/siswa")}
          className="group rounded-3xl border border-green-100 bg-green-50 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-xl"
        >
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-lg font-black text-white transition group-hover:scale-110">
            S
          </span>
          <h3 className="text-lg font-black text-gray-900">Siswa</h3>
          <p className="mt-1 text-sm text-gray-500">
            Belajar bahasa Kaili dengan materi, latihan, dan mini games.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/register/guru")}
          className="group rounded-3xl border border-blue-100 bg-blue-50 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
        >
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white transition group-hover:scale-110">
            G
          </span>
          <h3 className="text-lg font-black text-gray-900">Guru / Host</h3>
          <p className="mt-1 text-sm text-gray-500">
            Buat soal, kelola room kelas, dan pantau jawaban siswa.
          </p>
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="font-bold text-green-600"
        >
          Masuk
        </button>
      </p>
    </AuthPageShell>
  );
}

export default RegisterSelect;
