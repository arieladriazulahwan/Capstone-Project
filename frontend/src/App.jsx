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
import Lesson from "./pages/Lesson";
import Practice from "./pages/Practice";
import Quiz from "./pages/Quiz";
import BuatRoom from "./pages/BuatRoom";
import DetailRoom from "./pages/DetailRoom";
import QuizPage from "./pages/QuizPage";
import QuizRoom from "./pages/QuizRoom";

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
        <Route path="/guru/buat-room" element={<BuatRoom />} />
        <Route path="/lesson/bab1" element={<LessonBab1 />} />
        <Route path="/quiz/bab1" element={<QuizBab1 />} />
        <Route path="/practice/bab1" element={<PracticeBab1 />} />
        <Route path="/lesson/:dialect/:bab" element={<Lesson />} />
        <Route path="/lesson/:dialect/:bab/practice" element={<Practice />} />
        <Route path="/lesson/:dialect/:bab/quiz" element={<Quiz />} />
        <Route path="/quiz/:code" element={<QuizPage />} />
        <Route path="/quiz/:code" element={<QuizRoom />} />
        <Route path="/practice/:dialect/:bab" element={<Practice />} />
        <Route path="/guru/room/:id" element={<DetailRoom />} />
        <Route path="/quiz/:dialect/:bab" element={<Quiz />} />
        <Route path="/lesson/:dialect/bab1" element={<LessonBab1 />} />

      </Routes>
    </Router>
  );
}

export default App;