import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '../api';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Session Corrupt", e);
  }

  const handleDelete = async () => {
    if (!user) return;
    const confirm = window.confirm("🚨 WARNING: Are you sure you want to completely delete your account?\n\nThis will permanently erase all your Quiz history, bookmarks, and rankings.\nThis action CANNOT be undone.");
    
    if (confirm) {
      setLoading(true);
      try {
        await deleteAccount(user.identifier);
        
        // Clear all local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect completely
        window.location.href = '/signup';
      } catch (err) {
        setError('Failed to delete account. Please try again later.');
        setLoading(false);
      }
    }
  };

  if (!user) return <div className="reveal container" style={{ padding: '8rem 0', textAlign: 'center' }}><h2>Insufficient Access</h2></div>;

  return (
    <div className="reveal container" style={{ padding: '8rem 0' }}>
      <div className="auth-box">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-pure)' }}>Account <span className="pink-glow">Settings</span></h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem', fontWeight: 500 }}>Manage your QuizMaster profile</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '2rem', fontWeight: 600 }}>{error}</div>}

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-pure)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Profile Details</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Name</span>
            <span style={{ color: 'var(--text-pure)', fontWeight: 700 }}>{user.name}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Identifier</span>
            <span style={{ color: 'var(--text-pure)' }}>{user.identifier}</span>
          </div>
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--danger)', fontWeight: 800 }}>Danger Zone</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '2rem' }}>Once you delete your account, there is no going back. Please be certain.</p>
          
          <button 
            onClick={handleDelete}
            disabled={loading}
            className="btn" 
            style={{ 
              width: '100%', 
              background: '#EF4444', 
              color: 'white', 
              fontWeight: 700,
              padding: '1.2rem'
            }}
          >
            {loading ? 'Terminating...' : 'DELETE MY ACCOUNT FOREVER'}
          </button>
        </div>
      </div>
    </div>
  );
}
