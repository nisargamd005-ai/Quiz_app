import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { playSound } from '../App';

function MasteryChart({ percentage }) {
  const dash = (percentage / 100) * 283;
  return (
    <div style={{ position: 'relative', width: '240px', height: '240px', margin: '0 auto' }}>
      <svg width="240" height="240" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#111" strokeWidth="8" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--pink-elite)" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - dash} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 3s cubic-bezier(0.19, 1, 0.22, 1)' }} />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-0.05em' }}>{percentage}%</h2>
        <p style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.4, letterSpacing: '0.2em' }}>ACCURACY</p>
      </div>
    </div>
  );
}

function SparkleEffect({ percentage }) {
  if (percentage < 60) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999 }}>
      {[...Array(60)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '-20px',
          left: `${Math.random() * 100}%`,
          width: '6px',
          height: '18px',
          background: i % 2 === 0 ? 'var(--pink-elite)' : '#ffd700',
          boxShadow: `0 0 15px ${i % 2 === 0 ? 'rgba(233, 30, 99, 0.8)' : 'rgba(255, 215, 0, 0.8)'}`,
          borderRadius: '50px',
          animation: `sparkleFall ${2 + Math.random() * 3}s ${Math.random()}s linear infinite`,
        }} />
      ))}
      <style>{`
        @keyframes sparkleFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(${720 + Math.random() * 720}deg); opacity: 0; }
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
    else {
      // 🔊 Elite Victory Chord
      if (state.result.percentage >= 80) {
        setTimeout(() => playSound(440, 'sine', 1), 100);
        setTimeout(() => playSound(554.37, 'sine', 1), 200);
        setTimeout(() => playSound(659.25, 'sine', 1), 300);
      } else {
        setTimeout(() => playSound(220, 'triangle', 0.5), 100);
      }
    }
  }, [state]);

  if (!state?.result) return null;

  const { result } = state;
  const { score, total, percentage } = result;

  const pass = percentage >= 60;

  const getRank = (pct) => {
    if (pct >= 100) return { title: 'GRAND MASTER', desc: 'System Perfection Achieved.', icon: '🏆', color: '#ffd700' };
    if (pct >= 80) return { title: 'ELITE MASTER', desc: 'Professional Accuracy.', icon: '🏆', color: '#ffb300' };
    if (pct >= 60) return { title: 'ASPIRANT PASS', desc: 'Objective Secured. Level Up.', icon: '🏆', color: '#c0c0c0' };
    return { title: 'CHALLENGE FAILED', desc: 'Return to the vault. Try Again.', icon: '🏮', color: 'rgba(255,255,255,0.2)' };
  };

  const rank = getRank(percentage);

  return (
    <div className="reveal container" style={{ padding: '6rem 0' }}>
      <SparkleEffect percentage={percentage} />

      <header style={{ textAlign: 'center', marginBottom: '8rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 950, color: pass ? 'var(--pink-elite)' : '#666', letterSpacing: '0.6em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
           {pass ? 'SYSTEM CLEARANCE: GRANTED ✓' : 'SYSTEM OVERRIDE: DENIED ✕'}
        </h4>
        <div style={{ fontSize: '7rem', marginBottom: '2rem', filter: pass ? 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.4))' : 'none', animation: pass ? 'pulseElite 2s infinite ease-in-out' : 'none' }}>
           {rank.icon}
        </div>
        <h1 style={{ fontSize: '6rem', fontWeight: 950, letterSpacing: '-0.06em', textTransform: 'uppercase', lineHeight: 0.8, color: pass ? 'var(--text-pure)' : '#444' }}>
           {pass ? 'STATUS: ' : ''} <span className={pass ? "pink-glow" : ""}> {pass ? 'PASSED' : 'TRY AGAIN'}</span>
        </h1>
        <p className="reveal" style={{ fontSize: '1.4rem', opacity: 0.4, marginTop: '2.5rem', fontWeight: 500 }}>
           {rank.title}: {rank.desc}
        </p>
      </header>

      <style>{`
         @keyframes pulseElite {
           0% { transform: scale(1); }
           50% { transform: scale(1.15); filter: drop-shadow(0 0 50px rgba(255, 215, 0, 0.6)); }
           100% { transform: scale(1); }
         }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', marginBottom: '8rem' }}>
         <div style={{ background: 'var(--bg-card)', padding: '5rem 3rem', borderRadius: 'var(--radius-xl)', border: 'var(--border-pink)', textAlign: 'center', backdropFilter: 'var(--glass)', boxShadow: 'var(--shadow-pink)' }}>
            <MasteryChart percentage={percentage} />
         </div>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={{ flex: 1, background: 'var(--bg-card)', border: 'var(--border-pink)', borderRadius: 'var(--radius-lg)', padding: '3.5rem', textAlign: 'center', transition: 'all 0.4s' }}>
               <h2 style={{ fontSize: '4.5rem', fontWeight: 950 }}>{score} / {total}</h2>
               <p style={{ fontSize: '0.85rem', opacity: 0.5, fontWeight: 900, letterSpacing: '0.2em' }}>ACCURACY METRICS</p>
            </div>
            <div style={{ flex: 1, background: 'var(--bg-card)', border: 'var(--border-pink)', borderRadius: 'var(--radius-lg)', padding: '3.5rem', textAlign: 'center' }}>
               <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--pink-elite)' }}>{total - score} MISSED</h2>
               <p style={{ fontSize: '0.85rem', opacity: 0.5, fontWeight: 900, letterSpacing: '0.2em' }}>CORRECTION POTENTIAL</p>
            </div>
         </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem' }}>
         <button className="btn btn-primary btn-lg" style={{ minWidth: '220px' }} onClick={() => navigate('/quiz')}>🔄 RE-CHALLENGE</button>
         <button className="btn btn-outline btn-lg" style={{ minWidth: '220px' }} onClick={() => navigate('/')}>🏠 RETURN HOME</button>
      </div>
    </div>
  );
}
