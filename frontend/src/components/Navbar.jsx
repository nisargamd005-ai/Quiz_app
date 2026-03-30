import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Session Corrupt", e);
    localStorage.removeItem('user');
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="navbar" style={{ padding: '0 2rem' }}>
      <div className="container" style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
        <Link to="/" className="navbar-logo">
          Quiz<span>Master</span>
        </Link>
        
        <ul className="navbar-links">
          {user && (
            <>
              <li><NavLink to="/" end>Home</NavLink></li>
              <li><NavLink to="/daily">🎯 Daily</NavLink></li>
              <li><NavLink to="/leaderboard">Rankings</NavLink></li>
              <li><NavLink to="/history">History</NavLink></li>
            </>
          )}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--pink-elite)' }}>
                {user.name.toUpperCase()}
              </span>
              <Link to="/settings" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-pure)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
              >⚙️ Settings</Link>
              <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }} onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}>Login</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}>Join Now</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
