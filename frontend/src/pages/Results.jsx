import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function SparkleEffect({ passed }) {
  if (!passed) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999 }}>
      {[...Array(40)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '-20px',
          left: `${Math.random() * 100}%`,
          width: '5px',
          height: '15px',
          background: i % 2 === 0 ? '#e91e63' : '#db005d',
          boxShadow: '0 0 15px rgba(233, 30, 99, 0.8)',
          borderRadius: '50px',
          animation: `sparkleFall ${1.5 + Math.random() * 2}s ${Math.random()}s linear infinite`,
        }} />
      ))}
      <style>{`
        @keyframes sparkleFall {
          to { transform: translateY(110vh) rotate(${Math.random() * 1080}deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.result) navigate('/');
  }, [state]);

  if (!state?.result) return null;

  const { result } = state;
  const { score, total, percentage, passed, answers } = result;

  const getRank = (pct) => {
    if (pct >= 90) return { rank: 'MASTER ELITE', desc: 'Outstanding precision and knowledge.' };
    if (pct >= 80) return { rank: 'DIAMOND RANK', desc: 'Professional level comprehension.' };
    if (pct >= 60) return { rank: 'CHALLENGER', desc: 'Capable but needs more refinement.' };
    return { rank: 'ASPIRANT', desc: 'Keep practicing to break into elite ranks.' };
  };

  const rank = getRank(percentage);

  return (
    <div className="reveal container" style={{ padding: '6rem 0' }}>
      <SparkleEffect passed={passed} />

      <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--pink-elite)', letterSpacing: '0.6em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Challenge Results</h4>
        <h1 style={{ fontSize: '7rem', fontWeight: 950, letterSpacing: '-0.06em', textTransform: 'uppercase', lineHeight: 0.8 }}>RANK: <span className="pink-glow">{rank.rank}</span></h1>
        <p className="reveal" style={{ fontSize: '1.25rem', opacity: 0.4, marginTop: '2.5rem', fontWeight: 500, fontStyle: 'italic' }}>{rank.desc}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '6rem' }}>
         <div style={{ background: 'var(--bg-card)', padding: '5rem', borderRadius: 'var(--radius-xl)', border: 'var(--border-pink)', textAlign: 'center' }}>
            <div style={{ fontSize: '12rem', fontWeight: 950, lineHeight: 1, color: 'var(--text-pure)' }}>{percentage}%</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--pink-elite)', letterSpacing: '0.4em', marginTop: '1rem' }}>TOTAL SCORE</div>
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ flex: 1, background: 'var(--bg-card)', border: 'var(--border-pink)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
               <h2 style={{ fontSize: '3rem', fontWeight: 900 }}>{score} / {total}</h2>
               <p style={{ opacity: 0.4, fontWeight: 700, letterSpacing: '0.1em' }}>CORRECT ANSWERS</p>
            </div>
            <div style={{ flex: 1, background: 'var(--bg-card)', border: 'var(--border-pink)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
               <h2 style={{ fontSize: '3rem', fontWeight: 900 }}>{total - score}</h2>
               <p style={{ opacity: 0.4, fontWeight: 700, letterSpacing: '0.1em' }}>MISSED OPPORTUNITIES</p>
            </div>
         </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem' }}>
         <button className="btn btn-primary btn-lg" onClick={() => navigate('/quiz')}>🔄 Re-Challenge</button>
         <button className="btn btn-outline btn-lg" onClick={() => navigate('/')}>🏠 Return Home</button>
      </div>
    </div>
  );
}
