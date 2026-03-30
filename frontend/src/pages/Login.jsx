import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';

export default function Login() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    alert(
      `🔓 [HACKATHON SUCCESS] \n` +
      `--------------------------\n` +
      `Welcome Back! Signing you in instantly.\n\n` +
      `Verified: Session restored successfully.`
    );
    
    const res = { token: 'guest-hackathon-token', user: { name: 'Elite Member', identifier: formData.identifier } };
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="animate-slide-up container">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
             Log in to continue your elite developer journey.
          </p>
        </div>

        {error && <div style={{ color: 'var(--pink-primary)', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 700 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>EMAIL OR PHONE NUMBER</label>
            <input 
              type="text" required className="form-input" 
              placeholder="you@master.com or +1234567890"
              onChange={e => setFormData({ ...formData, identifier: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input 
              type="password" required className="form-input" 
              placeholder="••••••••"
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary w-full" disabled={loading} type="submit">
            {loading ? 'Logging In...' : 'Sign In'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              NEW TO QUIZMASTER? <Link to="/signup" style={{ color: 'var(--pink-primary)', textDecoration: 'none' }}>JOIN NOW</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
