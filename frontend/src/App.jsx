import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RegisterSelect from "./pages/RegisterSelect";
import RegisterSiswa from "./pages/RegisterSiswa";
import RegisterGuru from "./pages/RegisterGuru";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import LoginSiswa from "./pages/LoginSiswa";
import LoginGuru from "./pages/LoginGuru";
import DashboardGuru from "./pages/DashboardGuru";
import Kamus from "./pages/Kamus";
import Level from "./pages/Level";
import LessonBab1 from "./pages/LessonBab1";
import QuizBab1 from "./pages/QuizBab1";
import PracticeBab1 from "./pages/PracticeBab1";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterSelect />} />
        <Route path="/register/siswa" element={<RegisterSiswa />} />
        <Route path="/register/guru" element={<RegisterGuru />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login/siswa" element={<LoginSiswa />} />
        <Route path="/login/guru" element={<LoginGuru />} />
        <Route path="/dashboard/guru" element={<DashboardGuru />} />
        <Route path="/kamus" element={<Kamus />} />
        <Route path="/level" element={<Level />} />
        <Route path="/riwayat" element={<div>Halaman Riwayat</div>} />
        <Route path="/guru/buat-room" element={<div>Buat Room</div>} />
        <Route path="/lesson/bab1" element={<LessonBab1 />} />
        <Route path="/quiz/bab1" element={<QuizBab1 />} />
        <Route path="/practice/bab1" element={<PracticeBab1 />} />
      </Routes>
    </Router>
  );
}

export default App;