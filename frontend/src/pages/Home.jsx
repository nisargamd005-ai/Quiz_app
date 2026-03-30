import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../api';

const TOPICS = [
  { name: 'HTML',       desc: 'Structure the Modern Web',  icon: '🌐' },
  { name: 'CSS',        desc: 'Elite Luxury Styling',      icon: '🎨' },
  { name: 'JavaScript', desc: 'High-Octane Logic',         icon: '⚡' },
  { name: 'Python',     desc: 'Scientific Precision',      icon: '🐍' },
  { name: 'SQL',        desc: 'Relational Intelligence',   icon: '🗄️' },
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="reveal">
      <section className="hero container">
        <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--pink-elite)', letterSpacing: '0.6em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          {user ? `Welcome back, ${user.name}` : 'Welcome to the Elite Vault'}
        </h4>
        <h1>CODE <span className="pink-glow">MASTERY</span></h1>
        <p>Interactive quizzes to transform you from aspirant to master of the web. 🏺👑</p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/quiz" className="btn btn-primary btn-lg">START CHALLENGE</Link>
          <Link to="/daily" className="btn btn-outline btn-lg">🎯 DAILY CHALLENGE</Link>
          <Link to="/leaderboard" className="btn btn-outline btn-lg">🏆 RANKINGS</Link>
        </div>
      </section>

      {/* ── Daily Challenge Banner ── */}
      <section className="container" style={{ paddingBottom: '4rem' }}>
        <Link to="/daily" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(34, 197, 94, 0.08) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.19,1,0.22,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--pink-elite)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-pink)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: '3rem', animation: 'pulseIcon 2s infinite ease-in-out' }}>🎯</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Today's Daily Challenge
              </p>
              <p style={{ fontSize: '0.9rem', opacity: 0.5, fontWeight: 500 }}>
                5 curated questions · Same for everyone · Compare your score globally
              </p>
            </div>
            <div style={{ fontSize: '1.5rem', color: 'var(--pink-elite)', fontWeight: 900 }}>→</div>
          </div>
        </Link>
      </section>

      {/* ── Feature highlights ── */}
      <section className="container" style={{ paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🧠', title: 'ELI5 Mode',        desc: 'Simple explanations toggle' },
            { icon: '🗣️', title: 'Voice Quiz',        desc: 'Listen & answer by voice' },
            { icon: '🧪', title: 'Practice & Exam',   desc: 'Chill learn or strict test' },
            { icon: '🎯', title: 'Daily Challenge',   desc: 'Fresh quiz every day' },
          ].map(f => (
            <div key={f.title} style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{f.icon}</div>
              <p style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{f.title}</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.4, fontWeight: 500 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Disciplines ── */}
      <section className="container" style={{ paddingBottom: '10rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>CHOOSE YOUR <span className="pink-glow">DISCIPLINE</span></h2>
          <div style={{ opacity: 0.4, fontSize: '0.75rem', fontWeight: 800 }}>{stats?.total_questions || 0} QUESTS ONLINE</div>
        </div>

        <div className="topic-grid">
          {TOPICS.map((topic, i) => (
            <Link to={`/quiz?category=${topic.name}`} key={topic.name} className="card" style={{ animationDelay: `${i * 0.1}s`, textDecoration: 'none' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{topic.icon}</div>
              <h2>{topic.name}</h2>
              <p>{topic.desc}</p>
              <div style={{ marginTop: '2rem', color: 'var(--pink-elite)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em' }}>
                {stats?.distribution?.[topic.name] || 0} QUESTS →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer style={{ background: 'var(--bg-card)', color: 'var(--text-dim)', padding: '5rem 0', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4rem' }}>
        <p style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '0.1em' }}>QUIZ<span className="pink-glow">MASTER</span></p>
        <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>© {new Date().getFullYear()} Elite Learning Platform. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes pulseIcon { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
      `}</style>
    </div>
  );
}
