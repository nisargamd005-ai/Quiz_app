import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getStats } from '../api';

const TOPICS = [
  { name: 'HTML', desc: 'Structure the Web' },
  { name: 'CSS',  desc: 'Design Interfaces' },
  { name: 'JavaScript', desc: 'Add Logic & Life' },
  { name: 'Python', desc: 'Powerful Snippets' },
  { name: 'SQL', desc: 'Manage Data' },
];

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="animate-slide-up">
      <header className="hero">
        <div className="container">
          <h1 className="pill-badge" style={{ fontSize: '1.2rem', padding: '0.4rem 1.2rem', background: 'var(--pink-primary)', display: 'inline-block', borderRadius: '50px', marginBottom: '2rem', fontWeight: 900 }}>Elite Education</h1>
          <h1 style={{ marginBottom: '1.5rem' }}>Challenge Your <span className="pink-glow">Limits</span>.</h1>
          <p>Join the world's most attractive and powerful quiz platform for developers. Start your elite learning journey today.</p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/quiz')}>Start a Challenge</button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/signup')}>Join for Free</button>
          </div>
        </div>
      </header>

      <div className="container">
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4rem', textAlign: 'center' }}>
          Explore Our <span style={{ color: 'var(--pink-primary)' }}>Elite Topics</span>
        </h2>
        
        <div className="topic-grid">
          {TOPICS.map((topic, i) => (
            <div 
              key={topic.name} 
              className="topic-card"
              onClick={() => navigate(`/quiz?category=${topic.name}`)}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <h2>{topic.name}</h2>
              <p>{topic.desc}</p>
              <div style={{ marginTop: '2.5rem', fontWeight: 900, color: 'var(--pink-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span>Take Challenge →</span>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stats?.categories?.[topic.name] || 0} Qs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ background: '#0a0a0a', padding: '6rem 0', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>Quiz<span style={{ color: 'var(--pink-primary)' }}>Master</span></p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 Elite Web Learning Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
