import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { playSound } from '../App';

function MasteryChart({ percentage }) {
  const dash = (percentage / 100) * 283;
  return (
    <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto' }}>
      <svg width="220" height="220" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#111" strokeWidth="8" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--pink-elite)" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - dash} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.19, 1, 0.22, 1)' }} />
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
      {[...Array(80)].map((_, i) => (
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
    if (!state?.questions) navigate('/');
    else {
      // 🔊 Elite Victory Chord
      const pass = getPercentage() >= 60;
      if (pass) {
        setTimeout(() => playSound(440, 'sine', 1), 100);
        setTimeout(() => playSound(554.37, 'sine', 1), 200);
        setTimeout(() => playSound(659.25, 'sine', 1), 300);
      } else {
        setTimeout(() => playSound(220, 'triangle', 0.5), 100);
      }
    }
  }, [state]);

  if (!state?.questions) return null;

  const questions = state.questions || [];
  const answers = state.answers || {};
  const mode = state.mode || 'practice';
  let correctCount = 0;
  let totalTime = 0;
  let gamifiedXP = 0;
  let mistakeQuestions = [];

  questions.forEach((q, idx) => {
    const ans = answers[q.id];
    const isBoss = (mode !== 'practice' && idx === questions.length - 1);
    
    if (ans) {
      totalTime += (ans.time || 0);
      if (ans.selected === q.correct_answer) {
        correctCount++;
        gamifiedXP += isBoss ? 500 : 100; // Bonus points for correct answers
      } else {
        mistakeQuestions.push(q);
      }
    } else {
      mistakeQuestions.push(q);
    }
  });

  const getPercentage = () => Math.round((correctCount / questions.length) * 100);
  const percentage = getPercentage();
  const pass = percentage >= 60;
  const avgTime = Math.round(totalTime / questions.length);

  const getRank = (pct) => {
    if (pct >= 100) return { title: 'GRAND MASTER', desc: 'System Perfection Achieved.', icon: '🏆', color: '#ffd700' };
    if (pct >= 80) return { title: 'ELITE MASTER', desc: 'Professional Accuracy.', icon: '🏆', color: '#ffb300' };
    if (pct >= 60) return { title: 'ASPIRANT PASS', desc: 'Objective Secured. Level Up.', icon: '🏆', color: '#c0c0c0' };
    return { title: 'CHALLENGE FAILED', desc: 'Return to the vault. Try Again.', icon: '🏮', color: 'rgba(255,255,255,0.2)' };
  };

  const getTimeAnalysis = (avg) => {
    if (avg < 5) return { label: 'Lightning Fast ⚡', comment: 'Careful not to rush.' };
    if (avg < 15) return { label: 'Optimal Pacing ⏱️', comment: 'Perfect blend of speed and accuracy.' };
    return { label: 'Deep Thinker 🧠', comment: 'Consider trusting your gut more.' };
  };

  const rank = getRank(percentage);
  const timeAnalysis = getTimeAnalysis(avgTime);

  const handlePracticeMistakes = () => {
    navigate('/quiz/play', { state: { mistakeQuestions } });
  };

  return (
    <div className="reveal container" style={{ padding: '6rem 0' }}>
      <SparkleEffect percentage={percentage} />

      {/* ── Header ── */}
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
        <p className="reveal" style={{ fontSize: '1.4rem', opacity: 0.6, marginTop: '2.5rem', fontWeight: 500 }}>
           {rank.title}: {rank.desc}
        </p>
      </header>

      {/* ── Top Level Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
         {/* Chart Box */}
         <div style={{ background: 'var(--bg-card)', padding: '4rem 3rem', borderRadius: 'var(--radius-xl)', border: 'var(--border-pink)', textAlign: 'center', backdropFilter: 'var(--glass)', boxShadow: 'var(--shadow-pink)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <MasteryChart percentage={percentage} />
         </div>
         
         {/* Details Box */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={{ flex: 1, background: 'linear-gradient(135deg, rgba(255,215,0,0.05), rgba(233,30,99,0.05))', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 'var(--radius-lg)', padding: '3.5rem', textAlign: 'center', boxShadow: '0 0 30px rgba(255,215,0,0.1)' }}>
               <h2 style={{ fontSize: '3.5rem', fontWeight: 950, color: '#ffd700', marginBottom: '0.5rem' }}>+{gamifiedXP} XP</h2>
               <p style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Session Experience Points</p>
            </div>
            
            <div style={{ display: 'flex', gap: '2.5rem', flex: 1 }}>
              <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center' }}>
                 <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>{correctCount} / {questions.length}</h2>
                 <p style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 900, letterSpacing: '0.1em' }}>CORRECT HITS</p>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-card)', border: mistakeQuestions.length > 0 ? '1px dashed var(--pink-elite)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center' }}>
                 <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: mistakeQuestions.length > 0 ? 'var(--pink-elite)' : '#00c864' }}>{mistakeQuestions.length}</h2>
                 <p style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 900, letterSpacing: '0.1em' }}>MISTAKES</p>
              </div>
            </div>
         </div>
      </div>

      {/* ── Time Analysis ── */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: 'var(--border-pink)', padding: '4rem', marginBottom: '4rem', display: 'flex', alignItems: 'center', gap: '4rem', backdropFilter: 'var(--glass)' }}>
        <div style={{ fontSize: '4rem' }}>{timeAnalysis.label.split(' ')[1]}</div>
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--pink-elite)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>AI Time Analysis</h3>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.8rem' }}>{timeAnalysis.label.split(' ')[0]} Pace: {avgTime}s / q</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.6, fontWeight: 500 }}>{timeAnalysis.comment} You spent a total of {totalTime} seconds in the vault.</p>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
         {mistakeQuestions.length > 0 && (
           <button 
             className="btn" 
             style={{ 
               minWidth: '280px', 
               background: 'rgba(233,30,99,0.1)', 
               border: '1px solid var(--pink-elite)', 
               color: 'white',
               boxShadow: '0 0 30px var(--pink-glow)'
             }} 
             onClick={handlePracticeMistakes}
           >
             🔄 Practice Mistakes
           </button>
         )}
         <button className="btn btn-primary btn-lg" style={{ minWidth: '220px' }} onClick={() => navigate('/quiz')}>🔄 New Domain</button>
         <button className="btn btn-outline btn-lg" style={{ minWidth: '220px' }} onClick={() => navigate('/')}>🏠 Return Home</button>
      </div>

      <style>{`
         @keyframes pulseElite {
           0% { transform: scale(1); }
           50% { transform: scale(1.15); filter: drop-shadow(0 0 50px rgba(255, 215, 0, 0.6)); }
           100% { transform: scale(1); }
         }
      `}</style>
    </div>
  );
}
