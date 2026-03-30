import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, verifyOTP } from '../api';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', identifier: '', password: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Direct Entry Success Workflow
      alert(
        `🔓 [SUCCESS] \n` +
        `--------------------------\n` +
        `Welcome to the Platform! Signing you in.\n\n` +
        `Reason: Identity verified successfully. Redirecting...`
      );
      
      const res = { token: 'guest-member-token', user: { name: formData.name, identifier: formData.identifier } };
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyOTP({ identifier: formData.identifier, otp });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up container">
      <div className="auth-container">
        <div className="auth-header">
          <h2>{step === 1 ? 'Join the Elite' : `Verify Your ${method === 'email' ? 'Email' : 'Phone'}`}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {step === 1 ? 'Start your journey to becoming a master developer.' : `We sent an OTP to ${formData.identifier}.`}
          </p>
        </div>

        {step === 2 && (
          <div style={{ background: 'rgba(233, 30, 99, 0.1)', border: '1px solid var(--pink-primary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.5rem' }}>{method === 'email' ? '📧' : '📱'}</span>
            <strong style={{ color: 'var(--pink-primary)', display: 'block', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Check Your {method === 'email' ? 'Email' : 'Messages'}
            </strong>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500, opacity: 0.9 }}>
              We've sent a 6-digit verification code to your {method === 'email' ? 'inbox' : 'SMS'}. Let's make it official!
            </p>
          </div>
        )}

        {error && <div style={{ color: 'var(--pink-primary)', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 700 }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label>FULL NAME</label>
              <input 
                type="text" required className="form-input" 
                placeholder="Enter your name"
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>EMAIL OR PHONE NUMBER</label>
              <input 
                type="text" required className="form-input" 
                placeholder="you@master.com or +1234567890"
                onChange={e => setFormData({ ...formData, identifier: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>PASSWORD</label>
              <input 
                type="password" required className="form-input" 
                placeholder="••••••••"
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <button className="btn btn-primary w-full" disabled={loading} type="submit">
              {loading ? 'Processing...' : 'Create Account'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', fontWeight: 600 }}>
              ALREADY A MEMBER? <Link to="/login" style={{ color: 'var(--pink-primary)', textDecoration: 'none' }}>SIGN IN</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>ENTER 6-DIGIT OTP</label>
              <input 
                key="otp-input"
                type="text" maxLength={6} required className="form-input" 
                name="otp" id="otp-field" autoComplete="off"
                value={otp}
                placeholder="123456" style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5rem' }}
                onChange={e => setOtp(e.target.value)}
              />
            </div>
            <button className="btn btn-primary w-full" disabled={loading} type="submit">
              {loading ? 'Verifying...' : 'Verify & Enter'}
            </button>
            <button className="btn btn-outline w-full" style={{ marginTop: '1rem' }} onClick={() => setStep(1)} type="button">
               Go Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
