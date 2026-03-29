import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getQuestions, submitQuiz } from '../api';

const TIME_PER_Q = 30;

export default function QuizPlay() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const params = {
      category: searchParams.get('category') || undefined,
      limit: 10
    };

    getQuestions(params)
      .then(qs => {
        if (qs.length === 0) navigate('/');
        setQuestions(qs);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, []);

  const autoReveal = useCallback(() => setRevealed(true), []);

  useEffect(() => {
    if (loading || revealed) return;
    setTimeLeft(TIME_PER_Q);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); autoReveal(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, loading, revealed]);

  const handleSelect = (optionId) => {
    if (revealed) return;
    clearInterval(timerRef.current);
    setAnswers(prev => ({ ...prev, [questions[current].id]: optionId }));
    setRevealed(true);
  };

  const handleNext = () => {
    setRevealed(false);
    setCurrent(c => c + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = questions.map(q => ({
      question_id: q.id,
      selected_option: answers[q.id] || '',
    }));
    try {
      const result = await submitQuiz(payload);
      navigate('/results', { state: { result, questions } });
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <h1 className="reveal" style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.6em', opacity: 0.5 }}>Syncing Elite Questions...</h1>
    </div>
  );

  const q = questions[current];
  const selected = answers[q.id];
  const isLast = current === questions.length - 1;
  const progress = ((current + (revealed ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="reveal container">
      <div style={{ padding: '6rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
           <div>
             <h4 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', color: 'var(--pink-elite)', marginBottom: '1rem' }}>
                Challenge: {q.category}
             </h4>
             <h2 className="reveal" style={{ fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 500, letterSpacing: '0.2em', opacity: 0.6 }}>
                Phase {current + 1} of {questions.length} / Timer: {timeLeft}s
             </h2>
           </div>
           {/* Progress Line */}
           <div style={{ display: 'flex', gap: '4px', height: '6px', width: '250px' }}>
              {questions.map((_, i) => (
                <div key={i} style={{ 
                  flex: 1, 
                  background: i === current ? 'var(--pink-elite)' : i < current ? '#333' : '#111', 
                  borderRadius: '2px', 
                  transition: 'all 0.4s' 
                }} />
              ))}
           </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '5rem', borderRadius: 'var(--radius-xl)', border: 'var(--border-pink)', boxShadow: 'var(--shadow-pink)', backdropFilter: 'var(--glass)' }}>
          <div className="reveal quiz-q">
            {q.question}
          </div>

          <div style={{ display: 'grid', gap: '1.5rem', marginTop: '3rem' }}>
            {q.options.map(opt => {
              let cls = 'option-btn';
              if (opt.id === selected) cls += ' selected';
              if (revealed) {
                if (opt.id === q.correct_answer) cls += ' correct-visual';
                else if (opt.id === selected) cls += ' wrong-visual';
              }

              return (
                <div key={opt.id} className={cls} onClick={() => handleSelect(opt.id)} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                   <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>0{opt.id.toUpperCase().charCodeAt(0) - 64}</span>
                   {opt.text}
                </div>
              );
            })}
          </div>

          {revealed && (
            <div className="reveal" style={{ marginTop: '4rem', padding: '3.5rem', background: selected === q.correct_answer ? 'rgba(0,100,50,0.1)' : 'rgba(233,30,99,0.05)', borderRadius: 'var(--radius-lg)', borderLeft: '8px solid var(--pink-elite)' }}>
               <h4 style={{ color: selected === q.correct_answer ? 'var(--text-pure)' : 'var(--pink-elite)', marginBottom: '1rem', fontWeight: 900, letterSpacing: '0.2em', fontSize: '0.85rem' }}>
                 {selected === q.correct_answer ? 'IDENTIFIED CORRECTLY ✓' : 'SYSTEM OVERRIDE ✕'}
               </h4>
               <p style={{ fontWeight: 500, fontSize: '1.15rem', opacity: 0.8, lineHeight: 1.6 }}>{q.explanation}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4rem 0' }}>
           <button className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)' }} onClick={() => navigate('/')}>✕ Quit Challenge</button>
           
           {revealed && (
             isLast ? (
               <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
                 {submitting ? 'Processing Result...' : 'Finalize & Rank 🏁'}
               </button>
             ) : (
               <button className="btn btn-primary" onClick={handleNext}>
                 Advance →
               </button>
             )
           )}
        </div>
      </div>
      
      <style>{`
        .correct-visual { border-color: var(--pink-elite) !important; background: rgba(233, 30, 99, 0.2) !important; box-shadow: 0 0 30px var(--pink-glow); }
        .wrong-visual { border-color: rgba(255,255,255,0.4) !important; opacity: 0.4; }
      `}</style>
    </div>
  );
}
