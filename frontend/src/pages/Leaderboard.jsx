import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api';

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(setBoard).finally(() => setLoading(false));
  }, []);

  return (
    <div className="reveal container" style={{ padding: '6rem 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--pink-elite)', letterSpacing: '0.6em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Social Rankings</h4>
        <h1 style={{ fontSize: '5rem', fontWeight: 950, letterSpacing: '-0.06em', textTransform: 'uppercase', lineHeight: 0.9 }}>Hall of <span className="pink-glow">Fame</span></h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.4, maxWidth: '600px', margin: '2rem auto 0', fontWeight: 500 }}>The top elite performers who have mastered the art of code.</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.5rem', opacity: 0.2 }}>SYNCING DATA...</div>
      ) : (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: 'var(--border-pink)', overflow: 'hidden', backdropFilter: 'var(--glass)' }}>
          {board.length === 0 ? (
             <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }}>NO RECORDS YET. START A CHALLENGE!</div>
          ) : (
             board.map((user, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '2.5rem 4rem', borderBottom: i === board.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }}>
                   <div style={{ fontSize: '3rem', fontWeight: 950, width: '100px', opacity: i < 3 ? 1 : 0.2, color: i === 0 ? '#ffd700' : 'inherit' }}>
                     {i + 1}
                   </div>
                   <div style={{ flex: 1 }}>
                     <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.name.toUpperCase()}</h3>
                     <p style={{ fontSize: '0.8rem', color: 'var(--pink-elite)', fontWeight: 700, letterSpacing: '0.1em' }}>MASTER ELITE LEVEL</p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--pink-elite)' }}>{user.score}%</div>
                     <div style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 700 }}>AVG ACCURACY</div>
                   </div>
                </div>
             ))
          )}
        </div>
      )}

      <div style={{ marginTop: '6rem', textAlign: 'center' }}>
         <p style={{ marginBottom: '2rem', opacity: 0.6, fontWeight: 500 }}>Think you can make the cut?</p>
         <button className="btn btn-primary" onClick={() => window.location.href = '/quiz'}>CHALLENGE THE BEST</button>
      </div>
    </div>
  );
}
