import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import QuizSetup from './pages/QuizSetup';
import QuizPlay from './pages/QuizPlay';
import Results from './pages/Results';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/signup"     element={<Signup />} />
        
        {/* Protected Routes */}
        <Route path="/quiz"       element={<ProtectedRoute><QuizSetup /></ProtectedRoute>} />
        <Route path="/quiz/play"  element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />
        <Route path="/results"    element={<ProtectedRoute><Results /></ProtectedRoute>} />
        
        <Route path="*"           element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
