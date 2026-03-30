import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // 🔒 Secret Admin Password
    if (password === 'admin123') {
      localStorage.setItem('adminToken', 'super-secret-admin');
      navigate('/admin');
      window.location.reload();
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="reveal container" style={{ padding: '8rem 0' }}>
      <div className="auth-box">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-pure)' }}>Admin Access</h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>Restricted area for QuizMasters</p>
        </div>

        {error && <div style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 700 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>ADMIN PASSWORD (admin123)</label>
            <input 
              type="password" required className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-primary w-full" type="submit" style={{ width: '100%' }}>
            ACCESS VAULT
          </button>
        </form>
      </div>
    </div>
  );
}
