import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getStats } from '../api';

const CATEGORIES = [
  { name: 'HTML', icon: '🌐', color: '#ffc0c7' },
  { name: 'CSS', icon: '🎨', color: '#fff4a3' },
  { name: 'JavaScript', icon: '⚡', color: '#1f2937' },
  { name: 'Python', icon: '🐍', color: '#f3f4f6' },
  { name: 'SQL', icon: '🗄️', color: '#96d4d4' },
];

export default function QuizSetup() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [setup, setSetup] = useState({
    category: params.get('category') || 'HTML',
    difficulty: 'Easy',
    limit: 10
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="reveal container" style={{ padding: '6rem 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--pink-primary)', letterSpacing: '0.6em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Challenge Configuration</h4>
        <h1 style={{ fontSize: '5rem', fontWeight: 950, letterSpacing: '-0.06em', textTransform: 'uppercase', lineHeight: 0.9 }}>Set Your <span className="pink-glow">Limit</span></h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.4, maxWidth: '600px', margin: '2rem auto 0', fontWeight: 500 }}>Choose your discipline and level of engagement.</p>
      </header>

      <div className="auth-box" style={{ maxWidth: '750px', margin: '0 auto', background: 'var(--bg-card)', padding: '5rem', backdropFilter: 'blur(20px)' }}>
        <div className="form-group">
          <label style={{ marginBottom: '2rem' }}>SELECT DISCIPLINE</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem' }}>
            {CATEGORIES.map(c => (
              <button key={c.name} className={`btn ${setup.category === c.name ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSetup({...setup, category: c.name})} style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: setup.category === c.name ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '2.5rem' }}>{c.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em' }}>{c.name.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '4rem' }}>
          <div className="form-group">
            <label>DIFFCULTY RANK</label>
            <select className="form-input" value={setup.difficulty} onChange={e => setSetup({...setup, difficulty: e.target.value})} style={{ background: '#000', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              <option value="Easy">EASY - TRAINEE</option>
              <option value="Medium">MEDIUM - PROFESSIONAL</option>
              <option value="Hard">HARD - MASTER ELITE</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>PHASE DEPTH (QUESTIONS)</label>
            <select className="form-input" value={setup.limit} onChange={e => setSetup({...setup, limit: parseInt(e.target.value)})} style={{ background: '#000', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              <option value="5">05 PHASES</option>
              <option value="10">10 PHASES</option>
              <option value="15">15 PHASES</option>
              <option value="20">20 PHASES</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary w-full" style={{ marginTop: '5rem', padding: '1.8rem', fontSize: '1.1rem', fontWeight: 900, boxShadow: '0 0 40px rgba(233,30,99,0.3)' }} onClick={() => navigate(`/quiz/play?category=${setup.category}&difficulty=${setup.difficulty}&limit=${setup.limit}`)}>
          INITIATE ELITE CHALLENGE →
        </button>
      </div>

      {stats && (
        <div style={{ textAlign: 'center', marginTop: '6rem', display: 'flex', justifyContent: 'center', gap: '4rem', opacity: 0.5, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.2em' }}>
           <div>{stats?.total_questions || 0} TOTAL QUESTIONS</div>
           <div>{stats?.total_users || 0} REGISTERED MASTERS</div>
        </div>
      )}
    </div>
  );
}
