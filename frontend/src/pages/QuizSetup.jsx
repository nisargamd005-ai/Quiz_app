import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getStats } from '../api';

const CATEGORIES = [
  { name: 'HTML',       icon: '🌐' },
  { name: 'CSS',        icon: '🎨' },
  { name: 'JavaScript', icon: '⚡' },
  { name: 'Python',     icon: '🐍' },
  { name: 'SQL',        icon: '🗄️' },
];

export default function QuizSetup() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [setup, setSetup] = useState({
    category:   params.get('category') || 'HTML',
    difficulty: 'Easy',
    limit:      10,
    mode:       'practice',
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  const MODES = [
    {
      id:    'practice',
      icon:  '🧪',
      label: 'Practice Mode',
      desc:  'Relax & learn. Hints allowed, no pressure.',
    },
    {
      id:    'exam',
      icon:  '🎯',
      label: 'Exam Mode',
      desc:  'Strict timer. No retries. Prove yourself.',
    },
  ];

  return (
    <div className="reveal container" style={{ padding: '6rem 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--pink-primary)', letterSpacing: '0.6em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Challenge Configuration
        </h4>
        <h1 style={{ fontSize: '5rem', fontWeight: 950, letterSpacing: '-0.06em', textTransform: 'uppercase', lineHeight: 0.9 }}>
          Set Your <span className="pink-glow">Limit</span>
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.4, maxWidth: '560px', margin: '2rem auto 0', fontWeight: 500 }}>
          Choose your discipline, difficulty and mode of engagement.
        </p>
      </header>

      {/* Daily Challenge Banner */}
      <Link to="/daily" style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(233,30,99,0.15), rgba(74,20,140,0.15))',
          border: '1px solid rgba(233,30,99,0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 3rem',
          marginBottom: '3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--pink-elite)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(233,30,99,0.4)'}
        >
          <span style={{ fontSize: '2.5rem' }}>🎯</span>
          <div>
            <p style={{ fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.2em', color: 'var(--pink-elite)', textTransform: 'uppercase' }}>
              Daily Challenge Available
            </p>
            <p style={{ fontSize: '0.9rem', opacity: 0.5, fontWeight: 500, marginTop: '0.3rem' }}>
              5 fresh questions every day · Same for everyone · Compete globally
            </p>
          </div>
          <div style={{ marginLeft: 'auto', color: 'var(--pink-elite)', fontWeight: 900, fontSize: '1.2rem' }}>→</div>
        </div>
      </Link>

      <div className="auth-box" style={{ maxWidth: '780px', margin: '0 auto', background: 'var(--bg-card)', padding: '5rem', backdropFilter: 'blur(20px)' }}>

        {/* Mode Selector */}
        <div className="form-group">
          <label style={{ marginBottom: '1.5rem' }}>SELECT MODE</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setSetup({ ...setup, mode: m.id })}
                style={{
                  padding: '2rem',
                  background: setup.mode === m.id ? 'rgba(233,30,99,0.12)' : 'rgba(255,255,255,0.03)',
                  border: setup.mode === m.id ? '1px solid var(--pink-elite)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s',
                  boxShadow: setup.mode === m.id ? 'var(--shadow-pink)' : 'none',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{m.icon}</div>
                <p style={{ fontWeight: 900, fontSize: '0.9rem', color: setup.mode === m.id ? 'var(--pink-elite)' : 'white', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {m.label}
                </p>
                <p style={{ fontSize: '0.8rem', opacity: 0.5, fontWeight: 500 }}>{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="form-group" style={{ marginTop: '3rem' }}>
          <label style={{ marginBottom: '1.5rem' }}>SELECT DISCIPLINE</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            {CATEGORIES.map(c => (
              <button
                key={c.name}
                className={`btn ${setup.category === c.name ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSetup({ ...setup, category: c.name })}
                style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}
              >
                <span style={{ fontSize: '1.8rem' }}>{c.icon}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em' }}>{c.name.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty & Count */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginTop: '3rem' }}>
          <div className="form-group">
            <label>DIFFICULTY</label>
            <select className="form-input" value={setup.difficulty} onChange={e => setSetup({ ...setup, difficulty: e.target.value })}
              style={{ background: '#000', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              <option value="Easy">EASY — Trainee</option>
              <option value="Medium">MEDIUM — Professional</option>
              <option value="Hard">HARD — Elite Master</option>
            </select>
          </div>

          <div className="form-group">
            <label>QUESTIONS</label>
            <select className="form-input" value={setup.limit} onChange={e => setSetup({ ...setup, limit: parseInt(e.target.value) })}
              style={{ background: '#000', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              <option value="5">05 Questions</option>
              <option value="10">10 Questions</option>
              <option value="15">15 Questions</option>
              <option value="20">20 Questions</option>
            </select>
          </div>
        </div>

        {/* Exam mode warning */}
        {setup.mode === 'exam' && (
          <div style={{ marginTop: '2rem', padding: '1.5rem 2rem', background: 'rgba(233,30,99,0.06)', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(233,30,99,0.4)' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--pink-elite)', fontWeight: 700 }}>
              ⚠️ EXAM MODE: Strict 20s per question. No hints. No retries. Results count toward your ranking.
            </p>
          </div>
        )}

        <button
          className="btn btn-primary w-full"
          style={{ marginTop: '4rem', padding: '1.8rem', fontSize: '1rem', fontWeight: 900, boxShadow: '0 0 40px rgba(233,30,99,0.3)' }}
          onClick={() => navigate(`/quiz/play?category=${setup.category}&difficulty=${setup.difficulty}&limit=${setup.limit}&mode=${setup.mode}`)}
        >
          {setup.mode === 'exam' ? '🎯 BEGIN EXAM →' : '🧪 START PRACTICE →'}
        </button>
      </div>

      {stats && (
        <div style={{ textAlign: 'center', marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '4rem', opacity: 0.4, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em' }}>
          <div>{stats?.total_questions || 0} TOTAL QUESTIONS</div>
          <div>{stats?.total_users || 0} REGISTERED MASTERS</div>
        </div>
      )}
    </div>
  );
}
