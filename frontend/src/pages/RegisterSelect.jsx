import { useNavigate } from "react-router-dom";

function RegisterSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md md:max-w-lg bg-white rounded-3xl shadow-xl p-6 md:p-8">

        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl shadow">
            🌿
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-center text-xl md:text-2xl font-bold text-green-600">
          Pilih Jenis Akun
        </h2>

        <p className="text-center text-gray-500 text-sm mb-6">
          Daftar sebagai siswa atau guru
        </p>

        {/* CARD LIST */}
        <div className="flex flex-col gap-4">

          {/* SISWA */}
          <div
            onClick={() => navigate("/register/siswa")}
            className="p-5 border rounded-2xl cursor-pointer transition-all duration-300 
            hover:shadow-lg hover:scale-[1.02] hover:border-green-500 hover:bg-green-50"
          >
            <div className="text-2xl mb-1">👨‍🎓</div>
            <h3 className="font-semibold text-gray-800">Siswa</h3>
            <p className="text-sm text-gray-500">
              Belajar bahasa Kaili dengan latihan & mini games seru
            </p>
          </div>

          {/* GURU */}
          <div
            onClick={() => navigate("/register/guru")}
            className="p-5 border rounded-2xl cursor-pointer transition-all duration-300 
            hover:shadow-lg hover:scale-[1.02] hover:border-blue-500 hover:bg-blue-50"
          >
            <div className="text-2xl mb-1">👨‍🏫</div>
            <h3 className="font-semibold text-gray-800">Guru / Host</h3>
            <p className="text-sm text-gray-500">
              Buat soal, kelola kelas, dan pantau perkembangan siswa
            </p>
          </div>

        </div>

        {/* BACK */}
        <p className="text-center text-sm mt-6 text-gray-500">
          Sudah punya akun?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-600 cursor-pointer font-medium"
          >
            Masuk
          </span>
        </p>

      </div>
    </div>
  );
}

export default RegisterSelect;