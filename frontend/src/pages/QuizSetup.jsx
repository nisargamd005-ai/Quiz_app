import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CATEGORIES = ['All', 'HTML', 'CSS', 'JavaScript', 'Python', 'SQL'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const LIMITS = [5, 10, 15, 20];

export default function QuizSetup() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const initCat = params.get('category') || 'All';
  const [category, setCategory] = useState(initCat);
  const [difficulty, setDifficulty] = useState('All');
  const [limit, setLimit] = useState(10);

  const handleStart = () => {
    const q = new URLSearchParams();
    if (category !== 'All') q.set('category', category);
    if (difficulty !== 'All') q.set('difficulty', difficulty);
    q.set('limit', limit);
    navigate(`/quiz/play?${q.toString()}`);
  };

  return (
    <div className="quiz-setup-page">
      <div className="page-header">
        <button
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '1rem' }}
          onClick={() => navigate('/')}
        >
          ← Back
        </button>
        <h1>Configure Your Quiz</h1>
        <p>Choose your preferences and start testing your skills</p>
      </div>

      <div className="card setup-card">
        <div className="setup-section">
          <span className="setup-label">Category</span>
          <div className="option-group">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`option-pill ${category === c ? 'selected' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <span className="setup-label">Difficulty</span>
          <div className="option-group">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`option-pill ${difficulty === d ? 'selected' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <span className="setup-label">Number of Questions</span>
          <div className="option-group">
            {LIMITS.map(l => (
              <button
                key={l}
                className={`option-pill ${limit === l ? 'selected' : ''}`}
                onClick={() => setLimit(l)}
              >
                {l} Questions
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-lg" onClick={handleStart}>
          Start Quiz →
        </button>
      </div>

      <div className="card" style={{ marginTop: '1.5rem', padding: '1.25rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {[
          { icon: '⏱️', label: 'Timed', desc: '30s per question' },
          { icon: '💡', label: 'Explanations', desc: 'After each answer' },
          { icon: '📊', label: 'Results', desc: 'Detailed breakdown' },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
