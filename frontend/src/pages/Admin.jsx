import { useState, useEffect } from 'react';
import { addQuestion, getQuestions, deleteQuestion, getStats, getAllUsers } from '../api';

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [qData, setQData] = useState({
    question: '',
    options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }],
    correct_answer: 'a', explanation: '', category: 'HTML', difficulty: 'Easy', hint: '', type: 'mcq'
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      if (tab === 'overview') setStats(await getStats());
      if (tab === 'manage') setQuestions(await getQuestions({ limit: 500 }));
      if (tab === 'users') setUsers(await getAllUsers());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadData(); }, [tab]);

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this question forever?")) return;
    await deleteQuestion(id);
    loadData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await addQuestion(qData);
      setMsg('Question successfully stored in Vault!');
      setQData({ ...qData, question: '', explanation: '', hint: '' });
    } catch (err) { setMsg('Failed to add question'); }
    finally { setLoading(false); }
  };

  return (
    <div className="reveal container" style={{ padding: '4rem 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--pink-elite)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1rem' }}>Admin Control Center</h4>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-pure)' }}>QuizMaster <span className="pink-glow">Dashboard</span></h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>📊 Overview</div>
          <div className={`admin-tab ${tab === 'manage' ? 'active' : ''}`} onClick={() => setTab('manage')}>📁 Manager</div>
          <div className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>👥 Users</div>
          <div className={`admin-tab ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>➕ Add</div>
        </div>
      </header>

      {/* 📊 OVERVIEW TAB */}
      {tab === 'overview' && stats && (
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
          <div className="card" style={{ background: 'var(--bg-darkest)' }}>
            <div style={{ fontSize: '3rem' }}>👥</div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--pink-elite)', margin: '1rem 0 0.5rem' }}>{stats.total_users}</h2>
            <p style={{ fontWeight: 600 }}>Total Registered Users</p>
          </div>
          <div className="card" style={{ background: 'var(--bg-darkest)' }}>
            <div style={{ fontSize: '3rem' }}>📚</div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-blue)', margin: '1rem 0 0.5rem' }}>{stats.total_questions}</h2>
            <p style={{ fontWeight: 600 }}>Questions In Vault</p>
          </div>
          <div className="card" style={{ background: 'var(--bg-darkest)', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-pure)' }}>Topic Distribution</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {Object.entries(stats.distribution).map(([cat, count]) => (
                <div key={cat} style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 800, color: 'var(--pink-elite)', marginRight: '1rem' }}>{cat}</span>
                  <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>{count} Qs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📁 MANAGE TAB */}
      {tab === 'manage' && (
        <div className="reveal" style={{ maxWidth: '1000px', margin: '0 auto', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Type</th><th>Category</th><th>Difficulty</th><th>Question</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.id}>
                  <td style={{ fontWeight: 700, color: 'var(--pink-elite)' }}>#{q.id}</td>
                  <td><span style={{ background: q.type==='sequence'?'#FEF08A':'#E0E7FF', color: q.type==='sequence'?'#854D0E':'#3730A3', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{q.type.toUpperCase()}</span></td>
                  <td>{q.category}</td>
                  <td>{q.difficulty}</td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.question}</td>
                  <td>
                    <button onClick={() => handleDelete(q.id)} style={{ background: '#FEE2E2', color: '#B91C1C', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {questions.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>No questions found.</p>}
        </div>
      )}

      {/* 👥 USERS TAB */}
      {tab === 'users' && (
        <div className="reveal" style={{ maxWidth: '1000px', margin: '0 auto', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Email / Phone</th><th>Name</th><th>Auth Type</th><th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700, color: 'var(--pink-elite)' }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.identifier}</td>
                  <td>{u.name}</td>
                  <td><span style={{ background: u.type === 'email' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: u.type === 'email' ? '#22C55E' : '#6366F1', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{u.type}</span></td>
                  <td>{new Date(u.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>No registered users yet.</p>}
        </div>
      )}

      {/* ➕ ADD TAB */}
      {tab === 'add' && (
        <div className="reveal auth-box" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {msg && <div style={{ color: 'white', background: 'var(--pink-elite)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '2rem', fontWeight: 600 }}>{msg}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>QUESTION TEXT</label>
              <textarea className="form-input" value={qData.question} onChange={e => setQData({ ...qData, question: e.target.value })} required rows={2} />
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <label>QUESTION TYPE</label>
                <select className="form-input" value={qData.type} onChange={e => setQData({ ...qData, type: e.target.value, correct_answer: e.target.value === 'mcq' ? 'a' : 'a,b,c,d' })}>
                  <option value="mcq">Multiple Choice</option>
                  <option value="sequence">Drag & Drop Sequence</option>
                </select>
              </div>
              <div className="form-group">
                <label>CORRECT ANSWER</label>
                {qData.type === 'mcq' ? (
                  <select className="form-input" value={qData.correct_answer} onChange={e => setQData({ ...qData, correct_answer: e.target.value })}>
                    {['a','b','c','d'].map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                  </select>
                ) : (
                  <input className="form-input" value={qData.correct_answer} onChange={e => setQData({ ...qData, correct_answer: e.target.value })} placeholder="e.g. b,a,d,c" required />
                )}
              </div>
              <div className="form-group">
                <label>CATEGORY</label>
                <select className="form-input" value={qData.category} onChange={e => setQData({ ...qData, category: e.target.value })}>
                  {['HTML','CSS','JavaScript','Python','SQL','React'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>DIFFICULTY</label>
                <select className="form-input" value={qData.difficulty} onChange={e => setQData({ ...qData, difficulty: e.target.value })}>
                  {['Easy','Medium','Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>EXPLANATION (EDUCATIONAL)</label>
              <textarea className="form-input" value={qData.explanation} onChange={e => setQData({ ...qData, explanation: e.target.value })} required rows={4} />
            </div>
            <div className="form-group">
              <label>HINT (OPTIONAL)</label>
              <input className="form-input" value={qData.hint} onChange={e => setQData({ ...qData, hint: e.target.value })} placeholder="Show a tiny clue before they fail..." />
            </div>
            <button className="btn btn-primary w-full" disabled={loading} type="submit" style={{ padding: '1.2rem', fontWeight: 600, fontSize: '1rem', width: '100%' }}>{loading ? 'SAVING...' : 'PUBLISH QUESTION'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
