import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { getQuestions, submitQuiz, toggleBookmark, getBookmarks } from '../api';
import { playSound } from '../App';

export default function QuizPlay() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const mode       = searchParams.get('mode') || 'practice';
  const isExam     = mode === 'exam';
  const rawLimit   = parseInt(searchParams.get('limit') || '10');

  const [questions,   setQuestions]   = useState([]);
  const [current,     setCurrent]     = useState(0);
  const [answers,     setAnswers]     = useState({}); // { qId: { selected: 'a', time: 10,  reflected: '' } }
  const [revealed,    setRevealed]    = useState(false);
  const [timeLeft,    setTimeLeft]    = useState(30);
  const [hintUsed,    setHintUsed]    = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [eli5,        setEli5]        = useState(false);
  const [listening,   setListening]   = useState(false);
  
  // New Gamification & Features
  const [bookmarks,   setBookmarks]   = useState(new Set());
  const [reflection,  setReflection]  = useState("");
  const [sequenceSelection, setSequenceSelection] = useState([]);

  const timerRef = useRef(null);
  
  // ── Load questions ─────────────────────────────────────────
  useEffect(() => {
    // If we're retrying mistakes from Results page
    if (location.state?.mistakeQuestions) {
      setQuestions(location.state.mistakeQuestions);
      setLoading(false);
      return;
    }

    const params = {
      category:   searchParams.get('category')   || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      limit:      rawLimit,
    };
    
    // Also fetch user's bookmarks to sync state
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      getBookmarks(user.identifier).then(bms => setBookmarks(new Set(bms.map(b => b.id)))).catch(()=>null);
    }

    getQuestions(params)
      .then(qs => { 
        if (qs.length === 0) navigate('/'); 
        
        // Mark all fetched questions as 'seen'
        const seenIds = JSON.parse(localStorage.getItem('seenQuestionIds') || '[]');
        const updatedSeenIds = Array.from(new Set([...seenIds, ...qs.map(q => q.id)]));
        localStorage.setItem('seenQuestionIds', JSON.stringify(updatedSeenIds.slice(-200))); // Keep last 200 to avoid total lockout
        
        setQuestions(qs); 
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, []);

  const q      = questions[current];
  const isLast = !loading && current === questions.length - 1;
  const isBoss = isLast && mode !== 'practice'; // Boss question on the final exam phase
  const TIME_PER_Q = isBoss ? 45 : (isExam ? 20 : 30);

  // ── Timer ─────────────────────────────────────────────────
  const autoReveal = useCallback(() => setRevealed(true), []);

  useEffect(() => {
    if (loading || revealed || !q) return;
    setTimeLeft(TIME_PER_Q);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); autoReveal(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, loading, revealed, TIME_PER_Q, q]);

  // ── Select answer ──────────────────────────────────────────
  const handleSelect = (optionId) => {
    if (revealed || q.type === 'sequence') return;
    clearInterval(timerRef.current);
    const correct = optionId === q.correct_answer;
    
    if (correct) playSound(isBoss ? 1320 : 880, 'sine', isBoss ? 1 : 0.5);
    else         playSound(110, 'triangle', 0.4);

    setAnswers(prev => ({ 
      ...prev, 
      [q.id]: { selected: optionId, time: TIME_PER_Q - timeLeft } 
    }));
    setRevealed(true);
  };

  // ── Sequence selection (Drag & drop alt) ───────────────────
  const handleSequenceClick = (optId) => {
    if (revealed) return;
    if (sequenceSelection.includes(optId)) {
      setSequenceSelection(sequenceSelection.filter(id => id !== optId));
    } else {
      setSequenceSelection([...sequenceSelection, optId]);
    }
  };

  const submitSequence = () => {
    clearInterval(timerRef.current);
    const selectedAns = sequenceSelection.join(',');
    const correct = selectedAns === q.correct_answer;
    if (correct) playSound(880, 'sine', 0.5); else playSound(110, 'triangle', 0.4);
    
    setAnswers(prev => ({ 
      ...prev, 
      [q.id]: { selected: selectedAns, time: TIME_PER_Q - timeLeft } 
    }));
    setRevealed(true);
  };

  // ── Bookmarks ──────────────────────────────────────────────
  const handleBookmark = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    const newSet = new Set(bookmarks);
    if (newSet.has(q.id)) newSet.delete(q.id);
    else newSet.add(q.id);
    setBookmarks(newSet);

    try {
      await toggleBookmark({ user_identifier: user.identifier, question_id: q.id });
    } catch(e) {}
  };

  const handleNext = () => {
    setRevealed(false);
    setHintUsed(false);
    setEli5(false);
    setReflection("");
    setSequenceSelection([]);
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
    if (revealed || q.type === 'sequence') return; // Cannot voice standard select once revealed
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
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) { navigate('/'); return; }

    const payload = questions.map(qq => ({
      question_id:     qq.id,
      selected_option: answers[qq.id]?.selected || '',
      time_taken:      answers[qq.id]?.time || TIME_PER_Q,
    }));
    
    let totalScore = 0;
    questions.forEach(qq => {
      const selected = answers[qq.id]?.selected;
      if (selected === qq.correct_answer) {
        // Double points for boss question
        totalScore += (mode !== 'practice' && qq.id === questions[questions.length-1].id) ? 2 : 1;
      }
    });

    try {
      const maxPossible = totalScore > questions.length ? totalScore : questions.length; // rough max for results
      await submitQuiz({
        user_identifier: user.identifier,
        category:        questions[0].category,
        answers:         payload,
        mode,
      });
      navigate('/results', { state: { questions, answers, mode } });
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <h1 className="reveal" style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.6em', opacity: 0.5 }}>Syncing Questions...</h1>
    </div>
  );

  const ansObj   = answers[q.id];
  const selected = ansObj?.selected;
  const timerColor = timeLeft > 10 ? '#fff' : timeLeft > 5 ? '#ffd700' : 'var(--pink-elite)';

  return (
    <div className="reveal container">
      {isBoss && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'radial-gradient(circle, rgba(255,0,50,0.15) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none', zIndex: -1, animation: 'pulseBoss 2s infinite' }} />
      )}

      <div style={{ padding: '4rem 0' }}>
        {/* ── Header row ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div>
            <span style={{
              display: 'inline-block',
              padding: '0.3rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: location.state?.mistakeQuestions ? 'rgba(255,165,0,0.2)' : isExam ? 'rgba(233,30,99,0.15)' : 'rgba(74,20,140,0.2)',
              border: `1px solid ${location.state?.mistakeQuestions ? '#ffa500' : isExam ? 'var(--pink-elite)' : 'rgba(150,100,255,0.5)'}`,
              fontSize: '0.65rem',
              fontWeight: 900,
              letterSpacing: '0.2em',
              color: location.state?.mistakeQuestions ? '#ffa500' : isExam ? 'var(--pink-elite)' : '#c084fc',
              textTransform: 'uppercase',
              marginBottom: '0.8rem',
            }}>
              {location.state?.mistakeQuestions ? '🔄 Practice Mistakes' : isExam ? '🎯 Exam Mode' : '🧪 Practice Mode'}
            </span>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', color: 'var(--pink-elite)', marginBottom: '0.6rem' }}>
              {isBoss ? '🔥 FINAL BOSS' : `${q.category} · ${q.difficulty}`}
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button
               onClick={handleBookmark}
               style={{ background: 'transparent', border: 'none', fontSize: '1.8rem', cursor: 'pointer', transition: 'all 0.2s', transform: bookmarks.has(q.id) ? 'scale(1.1)' : 'scale(1)' }}
               title={bookmarks.has(q.id) ? "Remove Bookmark" : "Bookmark Question"}
            >
               {bookmarks.has(q.id) ? '⭐' : '☆'}
            </button>
            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
              <svg width="64" height="64" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15" fill="none" stroke={isBoss ? 'rgba(233,30,99,0.3)' : '#1a1a1a'} strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke={timerColor} strokeWidth="3" strokeDasharray="94.2" strokeDashoffset={94.2 - (94.2 * timeLeft / TIME_PER_Q)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 900, color: timerColor }}>
                {timeLeft}
              </div>
            </div>
          </div>
        </div>

        {/* ── Question card ── */}
        <div style={{ 
          background: isBoss ? 'rgba(30,0,10,0.8)' : 'var(--bg-card)', 
          padding: '4rem', 
          borderRadius: 'var(--radius-xl)', 
          border: isBoss ? '2px solid rgba(255,50,100,0.6)' : 'var(--border-pink)', 
          boxShadow: isBoss ? '0 0 80px rgba(255,0,50,0.3)' : 'var(--shadow-pink)', 
          backdropFilter: 'blur(25px)', 
          position: 'relative' 
        }}>
          {!isExam && (
            <button className={eli5 ? 'btn btn-primary' : 'btn btn-outline'} style={{ position: 'absolute', top: '1.5rem', right: '2rem', borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem', fontSize: '0.65rem' }} onClick={() => setEli5(v => !v)}>
              🧠 {eli5 ? 'ELI5 ON' : 'ELI5 Mode'}
            </button>
          )}

          <div className="reveal quiz-q" style={{ fontSize: isBoss ? '3rem' : '2.5rem', color: isBoss ? '#fff' : 'inherit' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '0.7rem' }} onClick={() => handleSpeak(q.question)}>
                🔊 Listen
              </button>
              {q.type === 'mcq' && !revealed && (
                 <button className={`btn ${listening ? 'btn-primary' : 'btn-outline'}`} style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '0.7rem', animation: listening ? 'pulse 1s infinite' : 'none' }} onClick={handleListen}>
                   🎙️ {listening ? 'Listening...' : 'Voice Answer'}
                 </button>
              )}
            </div>
            {q.type === 'sequence' && <span style={{ display: 'block', fontSize: '1rem', color: '#ffd700', marginBottom: '1rem', letterSpacing: '0.1em' }}>🧩 MATCH & ARRANGE</span>}
            {q.question}
          </div>

          {eli5 && !revealed && (
            <div className="reveal" style={{ marginTop: '1.5rem', padding: '1.2rem 2rem', background: 'rgba(151,71,255,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(151,71,255,0.3)' }}>
              <p style={{ fontSize: '0.88rem', color: '#c084fc', fontWeight: 600 }}>🧠 <strong>Teacher's Hint:</strong> Focus on this... {q.hint}</p>
            </div>
          )}

          {/* Response Area */}
          <div style={{ marginTop: '3rem' }}>
            {q.type === 'sequence' ? (
              // Drag and drop / Sequence logic
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', minHeight: '60px', padding: '1rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 'var(--radius-md)' }}>
                  {sequenceSelection.length === 0 ? <span style={{ opacity: 0.3, fontSize: '0.8rem', margin: 'auto' }}>Click options below in the correct order to place them here.</span> : 
                    sequenceSelection.map((id, idx) => {
                      const opt = q.options.find(o=>o.id === id);
                      return (
                        <div key={id} onClick={() => !revealed && handleSequenceClick(id)} style={{ padding: '0.8rem 1.2rem', background: 'var(--pink-elite)', borderRadius: '4px', cursor: revealed ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(233,30,99,0.4)', animation: 'revealIn 0.2s' }}>
                          <span style={{opacity:0.6, marginRight:'0.5rem'}}>{idx+1}.</span>{opt.text}
                        </div>
                      )
                    })
                  }
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {q.options.filter(o => !sequenceSelection.includes(o.id)).map(opt => (
                     <div key={opt.id} onClick={() => handleSequenceClick(opt.id)} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', borderRadius: '4px', textAlign: 'center', transition: '0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                       {opt.text}
                     </div>
                  ))}
                </div>
                {!revealed && (
                  <button className="btn btn-primary" onClick={submitSequence} style={{ width: '100%', marginTop: '2rem' }} disabled={sequenceSelection.length !== q.options.length}>
                    LOCK SEQUENCE
                  </button>
                )}
              </>
            ) : (
              // Standard MCQ logic
              <div style={{ display: 'grid', gap: '1rem' }}>
                {q.options.map(opt => {
                  let cls = 'option-btn';
                  if (opt.id === selected) cls += ' selected';
                  if (revealed) {
                    if (opt.id === q.correct_answer) cls += ' correct-visual';
                    else if (opt.id === selected)    cls += ' wrong-visual';
                  }
                  return (
                    <div key={opt.id} className={cls} onClick={() => handleSelect(opt.id)} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', opacity: revealed && opt.id !== q.correct_answer && opt.id !== selected ? 0.35 : 1 }}>
                      <span style={{ fontSize: '0.75rem', opacity: 0.4, fontWeight: 900, minWidth: '20px' }}>{opt.id.toUpperCase()}</span>
                      {opt.text}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Explanation AI after reveal */}
          {revealed && (
            <div className="reveal" style={{ marginTop: '3rem', padding: '2.5rem', background: selected === q.correct_answer ? 'rgba(0,200,100,0.06)' : 'rgba(233,30,99,0.05)', borderRadius: 'var(--radius-lg)', borderLeft: `6px solid ${selected === q.correct_answer ? '#00c864' : 'var(--pink-elite)'}` }}>
              <h4 style={{ color: selected === q.correct_answer ? '#00c864' : 'var(--pink-elite)', marginBottom: '0.8rem', fontWeight: 900, letterSpacing: '0.15em', fontSize: '0.8rem' }}>
                {selected === q.correct_answer ? '✓ SYSTEM ACCEPTS YOUR LOGIC' : '✕ SYSTEM EXPLANATION AI'}
              </h4>
              
              {selected !== q.correct_answer ? (
                <>
                  <p style={{ fontWeight: 500, fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.7, marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--pink-elite)' }}>Common Mistake:</strong> It's totally normal to think it might be what you selected... but here is the correct logic:
                  </p>
                  <p style={{ fontWeight: 500, fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.7, paddingLeft: '1rem', borderLeft: '2px dashed rgba(255,255,255,0.2)' }}>
                    {q.explanation}
                  </p>
                </>
              ) : (
                <p style={{ fontWeight: 500, fontSize: '1.05rem', opacity: 0.85, lineHeight: 1.7 }}>
                  {q.explanation}
                </p>
              )}

              {/* Explain your answer (Reflection learning) */}
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.8rem' }}>📝 Personal Reflection (Optional)</p>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '80px', fontSize: '0.9rem' }} 
                  placeholder={selected === q.correct_answer ? "Why did you choose this? (Builds muscle memory)" : "What did you learn from this mistake?"}
                  value={reflection}
                  onChange={e=>setReflection(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3rem 0' }}>
          <button className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)' }} onClick={() => navigate('/')}>✕ Abort</button>
          
          <div style={{ display: 'flex', gap: '3px' }}>
              {questions.map((_, i) => (
                <div key={i} style={{ width: '12px', height: '4px', borderRadius: '4px', background: i < current ? (answers[questions[i].id]?.selected === questions[i].correct_answer ? 'var(--pink-elite)' : '#444') : i === current ? 'white' : '#1a1a1a', transition: 'all 0.3s' }} />
              ))}
          </div>

          {revealed && (
            isLast ? (
              <button className="btn btn-primary btn-lg" onClick={handleFinish} disabled={submitting}>
                {submitting ? 'Encrypting...' : 'View Assessment 🏁'}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleNext}>Initialize Next →</button>
            )
          )}
        </div>
      </div>

      <style>{`
        .correct-visual { border-color: #00c864 !important; background: rgba(0,200,100,0.12) !important; }
        .wrong-visual   { border-color: var(--pink-elite) !important; background: rgba(233,30,99,0.08) !important; }
        :root { --radius-full: 999px; }
        @keyframes pulseBoss { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
      `}</style>
    </div>
  );
}
