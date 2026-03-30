import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import QuizSetup from './pages/QuizSetup';
import QuizPlay from './pages/QuizPlay';
import Results from './pages/Results';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import DailyChallenge from './pages/DailyChallenge';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) return <Navigate to="/admin-login" replace />;
  return children;
};

// 🔊 Elite Haptic Audio Engine
export const playSound = (freq, type, duration) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
};

export default function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* 🪐 Global Atmospheric Nebula Elements */}
      <div className="nebula-particle nebula-1"></div>
      <div className="nebula-particle nebula-2"></div>
      <div className="nebula-particle nebula-3"></div>

      <Navbar />
      <main className="reveal">
        <Routes>
          {/* 🔐 Gatekeeper: Privacy Redirect */}
          <Route path="/"           element={token ? <Home /> : <Navigate to="/signup" replace />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/signup"     element={<Signup />} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          
          <Route path="/quiz"       element={<ProtectedRoute><QuizSetup /></ProtectedRoute>} />
          <Route path="/quiz/play"  element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />
          <Route path="/results"    element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/history"    element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/daily"      element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
          <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin"      element={<AdminRoute><Admin /></AdminRoute>} />
          
          <Route path="*"           element={<Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
