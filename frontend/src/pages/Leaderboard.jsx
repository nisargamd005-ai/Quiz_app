import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboard } from '../api';

const MEDALS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];

export default function Leaderboard() {
  const [board,  setBoard]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(setBoard).finally(() => setLoading(false));
  }, []);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  return (
    <div className="reveal container" style={{ padding: '6rem 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--pink-elite)', letterSpacing: '0.6em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Global Rankings
        </h4>
        <h1 style={{ fontSize: '5rem', fontWeight: 950, letterSpacing: '-0.06em', textTransform: 'uppercase', lineHeight: 0.9 }}>
          Hall of <span className="pink-glow">Fame</span>
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.4, maxWidth: '560px', margin: '2rem auto 0', fontWeight: 500 }}>
          The masters who conquered the vault. Will your name be here?
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '6rem', fontSize: '1.2rem', opacity: 0.3, letterSpacing: '0.4em' }}>
          SYNCING RANKS...
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {board.length >= 3 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '4rem' }}>
              {[1, 0, 2].map(idx => {
                const u = board[idx];
                if (!u) return null;
                const isFirst = idx === 0;
                return (
                  <div key={idx} style={{
                    textAlign: 'center',
                    flex: isFirst ? '0 0 220px' : '0 0 180px',
                  }}>
                    <div style={{ fontSize: isFirst ? '3.5rem' : '2.5rem', marginBottom: '0.5rem' }}>{MEDALS[idx]}</div>
                    <div style={{
                      background:   isFirst ? 'rgba(233,30,99,0.12)' : 'rgba(255,255,255,0.04)',
                      border:       `1px solid ${isFirst ? 'var(--pink-elite)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding:      isFirst ? '2.5rem 1.5rem' : '2rem 1.2rem',
                      boxShadow:    isFirst ? 'var(--shadow-pink)' : 'none',
                    }}>
                      <p style={{ fontWeight: 900, fontSize: isFirst ? '1rem' : '0.85rem', color: RANK_COLORS[idx], letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                        {u.name.toUpperCase()}
                      </p>
                      <p style={{ fontSize: isFirst ? '2.5rem' : '2rem', fontWeight: 950, color: RANK_COLORS[idx] }}>
                        {u.score}%
                      </p>
                      <p style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 700, marginTop: '0.4rem' }}>
                        {u.quizzes} quiz{u.quizzes !== 1 ? 'zes' : ''} · best {u.best}%
                      </p>
                    </div>
                    <div style={{
                      height:     isFirst ? '48px' : idx === 1 ? '32px' : '20px',
                      background: isFirst ? 'var(--pink-elite)' : RANK_COLORS[idx],
                      opacity:    0.5,
                      borderRadius: '0 0 4px 4px',
                      marginTop:  '-1px',
                    }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: 'var(--border-pink)', overflow: 'hidden', backdropFilter: 'var(--glass)' }}>
            {board.length === 0 ? (
              <div style={{ padding: '5rem', textAlign: 'center', opacity: 0.4 }}>
                No records yet. Be the first!
              </div>
            ) : (
              <>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 100px 80px', padding: '1.2rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.2em', opacity: 0.35, textTransform: 'uppercase' }}>
                  <span>#</span><span>Player</span><span style={{ textAlign: 'center' }}>Avg</span><span style={{ textAlign: 'center' }}>Best</span><span style={{ textAlign: 'center' }}>Quizzes</span>
                </div>
                {board.map((u, i) => {
                  const isMe = user && u.name === user.name;
                  return (
                    <div key={i} style={{
                      display:        'grid',
                      gridTemplateColumns: '60px 1fr 100px 100px 80px',
                      alignItems:     'center',
                      padding:        '1.8rem 3rem',
                      borderBottom:   i === board.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                      background:     isMe ? 'rgba(233,30,99,0.06)' : 'transparent',
                      transition:     'background 0.2s',
                    }}
                    onMouseEnter={e => !isMe && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => !isMe && (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontSize: '1.4rem', fontWeight: 950, color: i < 3 ? RANK_COLORS[i] : 'rgba(255,255,255,0.2)' }}>
                        {i < 3 ? MEDALS[i] : i + 1}
                      </span>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: '1rem' }}>{u.name.toUpperCase()}{isMe && <span style={{ color: 'var(--pink-elite)', fontSize: '0.65rem', marginLeft: '0.8rem', fontWeight: 900 }}>YOU</span>}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--pink-elite)', fontWeight: 700, opacity: 0.7, marginTop: '0.2rem' }}>
                          {i === 0 ? 'Grand Champion' : i === 1 ? 'Elite Master' : i === 2 ? 'Rising Star' : 'Competitor'}
                        </p>
                      </div>
                      <span style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 950, color: 'var(--pink-elite)' }}>{u.score}%</span>
                      <span style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 700, opacity: 0.6 }}>{u.best}%</span>
                      <span style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, opacity: 0.4 }}>{u.quizzes}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}

      <div style={{ marginTop: '5rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
        <Link to="/quiz" className="btn btn-primary">Challenge the Best</Link>
        <Link to="/daily" className="btn btn-outline">🎯 Daily Challenge</Link>
      </div>
    </div>
  );
}
