import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Quiz<span>Master</span>
      </Link>
      
      <ul className="navbar-links">
        <li><NavLink to="/" end>Explore</NavLink></li>
        <li><NavLink to="/quiz">Challenge</NavLink></li>
      </ul>

      <div className="navbar-actions">
        {user ? (
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
              HI, {user.name.split(' ')[0]}
            </span>
            <button className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}>Login</Link>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}>Join</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
