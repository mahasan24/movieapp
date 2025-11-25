import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginSignup from './components/LoginSignup.jsx'
import Home from './pages/Home.jsx'
import MovieDetail from './pages/MovieDetail.jsx'
import AdminImport from './pages/AdminImport.jsx'  // ← ADD THIS LINE
import Navbar from './components/Navbar.jsx'

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/login';

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/admin/import" element={<AdminImport />} />  {/* ← ADD THIS LINE */}
        <Route path="/login" element={<LoginSignup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App