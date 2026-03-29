import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../api';

const TOPICS = [
  { name: 'HTML', desc: 'Structure the Modern Web', icon: '🌐' },
  { name: 'CSS', desc: 'Elite Luxury Styling', icon: '🎨' },
  { name: 'JavaScript', desc: 'High-Octane Logic', icon: '⚡' },
  { name: 'Python', desc: 'Scientific Precision', icon: '🐍' },
  { name: 'SQL', desc: 'Relational Intelligence', icon: '🗄️' },
];

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="reveal">
      <section className="hero container">
        <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--pink-primary)', letterSpacing: '0.6em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Welcome to the Elite Vault</h4>
        <h1>CODE <span className="pink-glow">MASTERY</span></h1>
        <p>Interactive quizzes to transform you from an aspirant into a master of the web. 🏺👑</p>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
           <Link to="/signup" className="btn btn-primary btn-lg">START TRANSFORMATION</Link>
           <Link to="/leaderboard" className="btn btn-outline btn-lg">HALL OF FAME</Link>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: '10rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>CHOOSE YOUR <span className="pink-glow">DISCIPLINE</span></h2>
          <div style={{ opacity: 0.4, fontSize: '0.8rem', fontWeight: 800 }}>{stats?.total_questions || 0} QUESTS ONLINE</div>
        </div>

        <div className="topic-grid">
          {TOPICS.map((topic, i) => (
            <Link to={`/quiz?category=${topic.name}`} key={topic.name} className="card" style={{ animationDelay: `${i * 0.1}s`, textDecoration: 'none' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>{topic.icon}</div>
              <h2>{topic.name}</h2>
              <p>{topic.desc}</p>
              <div style={{ marginTop: '2.5rem', color: 'var(--pink-primary)', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em' }}>
                {stats?.distribution?.[topic.name] || 0} QUESTS AVAILABLE →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer style={{ background: '#0a0a0a', padding: '6rem 0', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '1.5rem', letterSpacing: '0.2em' }}>QUIZ<span className="pink-glow">MASTER</span></p>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 500 }}>© {new Date().getFullYear()} Elite World Learning Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
