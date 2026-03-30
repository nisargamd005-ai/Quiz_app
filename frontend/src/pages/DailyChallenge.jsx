import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyChallenge, submitDailyChallenge } from '../api';
import { playSound } from '../App';

const TIME_PER_Q = 20; // Exam mode always

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [data,       setData]       = useState(null);   // { date, questions }
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [revealed,   setRevealed]   = useState(false);
  const [listening,  setListening]  = useState(false);
  const [timeLeft,   setTimeLeft]   = useState(TIME_PER_Q);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    getDailyChallenge()
      .then(setData)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, []);

  const autoReveal = useCallback(() => setRevealed(true), []);

  useEffect(() => {
    if (loading || !data || revealed) return;
    setTimeLeft(TIME_PER_Q);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); autoReveal(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, loading, data, revealed]);

  const handleSelect = (optionId) => {
    if (revealed || !data) return;
    clearInterval(timerRef.current);
    const q = data.questions[current];
    const correct = optionId === q.correct_answer;
    if (correct) playSound(880, 'sine', 0.5);
    else         playSound(110, 'triangle', 0.4);
    setAnswers(prev => ({ ...prev, [q.id]: { selected: optionId, time: TIME_PER_Q - timeLeft } }));
    setRevealed(true);
  };

  const handleNext = () => {
    setRevealed(false);
    window.speechSynthesis?.cancel(); // Stop talking on next
    setCurrent(c => c + 1);
  };

  // ── Voice Features ──
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      if (q.type === 'mcq') {
        msg.text += ". Options are: " + q.options.map(o => `${o.id.toUpperCase()}, ${o.text}`).join(". ");
      }
      window.speechSynthesis.speak(msg);
    }
  };

  const handleListen = () => {
    if (revealed || q.type === 'sequence') return; 
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Voice recognition not supported in your browser.');
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      setListening(false);
      alert('Voice error: ' + e.error);
    };
    
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase().trim().replace(/[.,!?]/g, '');
      let matched = null;
      const tokens = transcript.split(' ');
      
      q.options.forEach(opt => {
        if (transcript.includes(opt.text.toLowerCase().trim()) && opt.text.length > 2) {
          matched = opt.id;
        }
        if (tokens.includes(opt.id) || transcript.includes('option ' + opt.id) || transcript.includes('choice ' + opt.id)) {
          matched = opt.id;
        }
      });

      if (matched) {
        handleSelect(matched);
      } else {
        alert(`Voice heard: "${transcript}", but couldn't match an option. Try saying "Option A" or read the text.`);
      }
    };
    
    window.speechSynthesis.cancel();
    recognition.start();
  };

  const handleFinish = async () => {
    setSubmitting(true);
    const user = JSON.parse(localStorage.getItem('user'));
    const questions = data.questions;
    const payload = questions.map(q => ({
      question_id:     q.id,
      selected_option: answers[q.id]?.selected || '',
      time_taken:      answers[q.id]?.time || TIME_PER_Q,
    }));
    try {
      const result = await submitDailyChallenge({
        user_identifier: user.identifier,
        category:        'Daily Challenge',
        answers:         payload,
        mode:            'exam',
      });
      navigate('/results', { state: { result, questions, answers, mode: 'exam', isDaily: true } });
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p className="reveal" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.6em', opacity: 0.5 }}>
        Loading today's challenge...
      </p>
    </div>
  );

  const questions  = data.questions;
  const q          = questions[current];
  const selected   = answers[q.id]?.selected;
  const isLast     = current === questions.length - 1;
  const timerColor = timeLeft > 10 ? '#fff' : timeLeft > 5 ? '#ffd700' : 'var(--pink-elite)';

  // Format today's date nicely
  const today = new Date(data.date);
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="reveal container">
      <div style={{ padding: '5rem 0' }}>

        {/* ── Daily header ── */}
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1.2rem', background: 'rgba(233,30,99,0.1)', border: '1px solid rgba(233,30,99,0.4)', borderRadius: '999px', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1rem' }}>🎯</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--pink-elite)', textTransform: 'uppercase' }}>Daily Challenge</span>
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-0.04em', textTransform: 'uppercase', lineHeight: 1, marginBottom: '0.8rem' }}>
            {dateStr}
          </h1>
          <p style={{ fontSize: '0.9rem', opacity: 0.4, fontWeight: 500 }}>
            5 questions · Strict 20s timer · Same challenge for everyone
          </p>
        </header>

        {/* ── Progress strip ── */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: '5px', borderRadius: '10px',
              background: i < current
                ? (answers[questions[i].id]?.selected === questions[i].correct_answer ? 'var(--pink-elite)' : '#333')
                : i === current ? 'white' : '#111',
              transition: 'all 0.4s',
            }} />
          ))}
        </div>

        {/* ── Question card ── */}
        <div style={{ background: 'var(--bg-card)', padding: '4rem', borderRadius: 'var(--radius-xl)', border: 'var(--border-pink)', boxShadow: 'var(--shadow-pink)', backdropFilter: 'var(--glass)' }}>

          {/* Timer + question number */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.4, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Question {current + 1} / {questions.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: timerColor, boxShadow: `0 0 8px ${timerColor}`, animation: timeLeft <= 5 ? 'pulse 0.5s infinite' : 'none' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 950, color: timerColor, fontVariantNumeric: 'tabular-nums' }}>
                {String(timeLeft).padStart(2, '0')}s
              </span>
            </div>
          </div>

          <div className="reveal quiz-q">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '0.7rem' }} onClick={() => handleSpeak(q.question)}>
                🔊 Listen
              </button>
              {!revealed && (
                 <button className={`btn ${listening ? 'btn-primary' : 'btn-outline'}`} style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '0.7rem', animation: listening ? 'pulse 1s infinite' : 'none' }} onClick={handleListen}>
                   🎙️ {listening ? 'Listening...' : 'Voice Answer'}
                 </button>
              )}
            </div>
            {q.question}
          </div>

          <div style={{ display: 'grid', gap: '1rem', marginTop: '2.5rem' }}>
            {q.options.map(opt => {
              let cls = 'option-btn';
              if (opt.id === selected)           cls += ' selected';
              if (revealed) {
                if (opt.id === q.correct_answer) cls += ' correct-visual';
                else if (opt.id === selected)    cls += ' wrong-visual';
              }
              return (
                <div
                  key={opt.id}
                  className={cls}
                  onClick={() => handleSelect(opt.id)}
                  style={{
                    display:  'flex',
                    alignItems: 'center',
                    gap:      '1.5rem',
                    opacity:  revealed && opt.id !== q.correct_answer && opt.id !== selected ? 0.3 : 1,
                    cursor:   revealed ? 'default' : 'pointer',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 900, minWidth: '18px' }}>{opt.id.toUpperCase()}</span>
                  {opt.text}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {revealed && (
            <div className="reveal" style={{ marginTop: '2.5rem', padding: '2rem 2.5rem', background: selected === q.correct_answer ? 'rgba(0,200,100,0.06)' : 'rgba(233,30,99,0.05)', borderRadius: 'var(--radius-lg)', borderLeft: `5px solid ${selected === q.correct_answer ? '#00c864' : 'var(--pink-elite)'}` }}>
              <h4 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.15em', color: selected === q.correct_answer ? '#00c864' : 'var(--pink-elite)', marginBottom: '0.6rem' }}>
                {selected === q.correct_answer ? '✓ CORRECT' : '✕ INCORRECT'}
              </h4>
              <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: 1.7 }}>{q.explanation}</p>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3rem 0' }}>
          <button className="btn btn-outline" onClick={() => navigate('/')}>✕ Exit</button>
          {revealed && (
            isLast ? (
              <button className="btn btn-primary btn-lg" onClick={handleFinish} disabled={submitting}>
                {submitting ? 'Submitting...' : 'See My Score 🏁'}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleNext}>Next →</button>
            )
          )}
        </div>
      </div>

      <style>{`
        .correct-visual { border-color: #00c864 !important; background: rgba(0,200,100,0.12) !important; }
        .wrong-visual   { border-color: var(--pink-elite) !important; background: rgba(233,30,99,0.08) !important; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
