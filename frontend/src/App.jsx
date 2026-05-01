import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RegisterSelect from "./pages/RegisterSelect";
import RegisterSiswa from "./pages/RegisterSiswa";
import RegisterGuru from "./pages/RegisterGuru";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import LoginSiswa from "./pages/LoginSiswa";
import LoginGuru from "./pages/LoginGuru";

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
      </Routes>
    </Router>
  );
}

export default App;