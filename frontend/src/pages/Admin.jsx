import { useState } from 'react';
import { addQuestion } from '../api';

export default function Admin() {
  const [qData, setQData] = useState({
    question: '',
    options: [
      { id: 'a', text: '' }, { id: 'b', text: '' },
      { id: 'c', text: '' }, { id: 'd', text: '' }
    ],
    correct_answer: 'a',
    explanation: '',
    category: 'HTML',
    difficulty: 'Easy',
    hint: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await addQuestion(qData);
      setMsg('Question added to Elite vault!');
      setQData({ ...qData, question: '', explanation: '', hint: '' });
    } catch (err) { setMsg('Failed to add question'); }
    finally { setLoading(false); }
  };

  return (
    <div className="reveal container" style={{ padding: '6rem 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--pink-primary)', letterSpacing: '0.6em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Creator Dashboard</h4>
        <h1 style={{ fontSize: '5rem', fontWeight: 950, letterSpacing: '-0.06em', textTransform: 'uppercase', lineHeight: 0.9 }}>Elite <span className="pink-glow">Vault</span></h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.4, maxWidth: '600px', margin: '2rem auto 0', fontWeight: 500 }}>Expand the knowledge of your global students.</p>
      </header>

      <div className="auth-box" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {msg && <div style={{ color: 'var(--pink-primary)', textAlign: 'center', marginBottom: '2rem', fontWeight: 800 }}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>QUESTION TEXT</label>
            <textarea className="form-input" value={qData.question} onChange={e => setQData({ ...qData, question: e.target.value })} required rows={3} style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', width: '100%' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {qData.options.map((opt, i) => (
              <div key={opt.id} className="form-group">
                <label>OPTION {opt.id.toUpperCase()}</label>
                <input className="form-input" value={opt.text} onChange={e => {
                  const newOpts = [...qData.options];
                  newOpts[i].text = e.target.value;
                  setQData({ ...qData, options: newOpts });
                }} required />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label>CORRECT ANSWER</label>
              <select className="form-input" value={qData.correct_answer} onChange={e => setQData({ ...qData, correct_answer: e.target.value })} style={{ background: '#000', color: 'white' }}>
                {['a','b','c','d'].map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>CATEGORY</label>
              <select className="form-input" value={qData.category} onChange={e => setQData({ ...qData, category: e.target.value })} style={{ background: '#000', color: 'white' }}>
                {['HTML','CSS','JavaScript','Python','SQL','React'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>DIFFICULTY</label>
              <select className="form-input" value={qData.difficulty} onChange={e => setQData({ ...qData, difficulty: e.target.value })} style={{ background: '#000', color: 'white' }}>
                {['Easy','Medium','Hard'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>EXPLANATION (EDUCATIONAL)</label>
            <textarea className="form-input" value={qData.explanation} onChange={e => setQData({ ...qData, explanation: e.target.value })} required rows={4} style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', width: '100%' }} />
          </div>
          <div className="form-group">
            <label>HINT (OPTIONAL)</label>
            <input className="form-input" value={qData.hint} onChange={e => setQData({ ...qData, hint: e.target.value })} />
          </div>
          <button className="btn btn-primary w-full" disabled={loading} type="submit" style={{ padding: '1.5rem', fontWeight: 900, fontSize: '1rem' }}>{loading ? 'STASHING...' : 'ADD TO VAULT'}</button>
        </form>
      </div>
    </div>
  );
}
