import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-3xl shadow-xl p-6 md:p-10">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center text-2xl text-white shadow-md">
            🌿
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-2xl md:text-3xl font-bold text-green-600">
          Sora Kaili
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8 text-sm md:text-base">
          Belajar Bahasa Ledo dengan Seru!
        </p>

        {/* ROLE SELECTION */}
        <p className="text-center mb-4 font-medium">Masuk sebagai:</p>

        <div className="flex flex-col md:flex-row gap-4">

          {/* SISWA CARD */}
          <div
            onClick={() => navigate("/login/siswa")}
            className="flex-1 p-6 rounded-2xl border bg-white text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-green-500 hover:bg-green-50"
          >
            <div className="text-3xl mb-2">👨‍🎓</div>
            <p className="font-semibold text-gray-700">Siswa</p>
          </div>

          {/* GURU CARD */}
          <div
            onClick={() => navigate("/login/guru")}
            className="flex-1 p-6 rounded-2xl border bg-white text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-500 hover:bg-blue-50"
          >
            <div className="text-3xl mb-2">👨‍🏫</div>
            <p className="font-semibold text-gray-700">Guru / Host</p>
          </div>

        </div>

        {/* REGISTER */}
        <p className="text-center text-sm mt-8 text-gray-500">
          Belum punya akun?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-green-600 cursor-pointer font-medium"
          >
            Daftar di sini
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;