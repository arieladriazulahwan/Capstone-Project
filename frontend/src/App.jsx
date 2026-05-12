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
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterSelect />} />
        <Route path="/register/siswa" element={<RegisterSiswa />} />
        <Route path="/register/guru" element={<RegisterGuru />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login/siswa" element={<LoginSiswa />} />
        <Route path="/login/guru" element={<LoginGuru />} />
        <Route
          path="/dashboard/guru"
          element={
            <ProtectedRoute allowedRole="guru">
              <DashboardGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kamus"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Kamus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/level"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Level />
            </ProtectedRoute>
          }
        />
        <Route path="/riwayat" element={<div>Halaman Riwayat</div>} />
        <Route
          path="/guru/buat-room"
          element={
            <ProtectedRoute allowedRole="guru">
              <BuatRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/bab1"
          element={
            <ProtectedRoute allowedRole="siswa">
              <LessonBab1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/bab1"
          element={
            <ProtectedRoute allowedRole="siswa">
              <QuizBab1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/bab1"
          element={
            <ProtectedRoute allowedRole="siswa">
              <PracticeBab1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:dialect/:bab"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Lesson />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:dialect/:bab/practice"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Practice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:dialect/:bab/quiz"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:code"
          element={
            <ProtectedRoute allowedRole="siswa">
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:code"
          element={
            <ProtectedRoute allowedRole="siswa">
              <QuizRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:dialect/:bab"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Practice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/room/:id"
          element={
            <ProtectedRoute allowedRole="guru">
              <DetailRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:dialect/:bab"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:dialect/bab1"
          element={
            <ProtectedRoute allowedRole="siswa">
              <LessonBab1 />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
