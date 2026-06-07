import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
// import RegisterSelect from "./pages/RegisterSelect";
import RegisterSiswa from "./pages/RegisterSiswa";
import RegisterGuru from "./pages/RegisterGuru";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import LoginSiswa from "./pages/LoginSiswa";
import LoginGuru from "./pages/LoginGuru";
import DashboardGuru from "./pages/DashboardGuru";
import Kamus from "./pages/Kamus";
import Favorites from "./pages/Favorites";
import Level from "./pages/Level";
import BabLevels from "./pages/BabLevels";
import Lesson from "./pages/Lesson";
import Practice from "./pages/Practice";
import Quiz from "./pages/Quiz";
import BuatRoom from "./pages/BuatRoom";
import DetailRoom from "./pages/DetailRoom";
import QuizPage from "./pages/QuizPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginAdmin from "./pages/LoginAdmin";
import DashboardAdmin from "./pages/DashboardAdmin";
import AdminKamus from "./pages/AdminKamus";
import AdminMateri from "./pages/AdminMateri";
import AdminUsers from "./pages/AdminUsers";
import AdminRooms from "./pages/AdminRooms";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<RegisterSelect />} /> */}
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
          path="/favorites"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Favorites />
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
        <Route
          path="/level/:dialect/:bab"
          element={
            <ProtectedRoute allowedRole="siswa">
              <BabLevels />
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
        <Route path="/lesson/bab1" element={<Navigate to="/lesson/ledo/bab1" replace />} />
        <Route path="/practice/bab1" element={<Navigate to="/practice/ledo/bab1" replace />} />
        <Route path="/quiz/bab1" element={<Navigate to="/quiz/ledo/bab1" replace />} />
        <Route
          path="/lesson/:dialect/:bab"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Lesson />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:dialect/:bab/:level"
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
          path="/practice/:dialect/:bab"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Practice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:dialect/:bab/:level"
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
          path="/quiz/:dialect/:bab/:level"
          element={
            <ProtectedRoute allowedRole="siswa">
              <Quiz />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route path="/login/admin" element={<LoginAdmin />} />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kamus"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminKamus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/materi"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminMateri />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminRooms />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
