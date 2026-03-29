import { useEffect, useState } from 'react';
import { getHistory } from '../api';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.email) {
      getHistory(user.email).then(setHistory).finally(() => setLoading(false));
    }
  }, []);

  return (
    <div className="reveal container" style={{ padding: '6rem 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--pink-primary)', letterSpacing: '0.6em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Personal Analytics</h4>
        <h1 style={{ fontSize: '5rem', fontWeight: 950, letterSpacing: '-0.06em', textTransform: 'uppercase', lineHeight: 0.9 }}>My <span className="pink-glow">Journey</span></h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.4, maxWidth: '600px', margin: '2rem auto 0', fontWeight: 500 }}>Track your evolution as a master developer.</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.5rem', opacity: 0.2 }}>SYNCING DATA...</div>
      ) : (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: 'var(--border-pink)', overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
          {history.length === 0 ? (
             <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }}>NO HISTORY YET. START A CHALLENGE!</div>
          ) : (
             history.map((res, i) => (
                <div key={res.id} style={{ display: 'flex', alignItems: 'center', padding: '2.5rem 4rem', borderBottom: i === history.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                   <div style={{ flex: 1 }}>
                     <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{res.category.toUpperCase()}</h3>
                     <p style={{ fontSize: '0.8rem', color: 'var(--pink-primary)', fontWeight: 700, letterSpacing: '0.1em' }}>
                        {new Date(res.timestamp).toLocaleDateString()} at {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--pink-primary)' }}>{res.score}/{res.total}</div>
                     <div style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 700 }}>{res.percentage}% ACCURACY</div>
                   </div>
                </div>
             ))
          )}
        </div>
      )}
    </div>
  );
}
