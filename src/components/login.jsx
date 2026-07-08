import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  // Basic email validation regex
  const isValidEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const validateFields = () => {
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Password is required.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateFields()) return;

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        // Handle error correctly by grabbing error.message instead of serializing the full object (which prints {})
        setError(authError.message || 'Invalid email or password. Please try again.');
      } else if (data?.user) {
        // Fetch role from profiles to route correctly if needed, otherwise route to dashboard
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        const role = profile?.role || data.user.user_metadata?.role || 'customer';
        setSuccess('Logged in successfully!');
        
        // Wait a tiny moment for the user to see the success state
        setTimeout(() => {
          if (role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/shop');
          }
        }, 800);
      }
    } catch (err) {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateFields()) return;

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'customer' // default role for standard login signup
          }
        }
      });

      if (authError) {
        setError(authError.message || 'Failed to create account. Please try again.');
      } else if (data?.user) {
        // Insert profile details
        await supabase.from('profiles').insert([{ id: data.user.id, role: 'customer' }]);
        await supabase.from('customers').insert([{ id: data.user.id, name: email.split('@')[0], email: email, user_id: data.user.id }]);
        
        setSuccess('Account created successfully. Please check your email for verification.');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError('A network error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email.trim() || !isValidEmail(email)) {
      setError('Please enter a valid email address to receive the reset link.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password reset link sent! Please check your email inbox.');
        setIsForgotPassword(false);
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 24px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        .input-group {
          margin-bottom: 20px;
        }
        .input-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }
        .text-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: all 0.2s ease;
          background: #f8fafc;
        }
        .text-input:focus {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }
        .btn-secondary {
          background: #f1f5f9;
          color: #1e293b;
          border: 2px solid #e2e8f0;
        }
        .btn-secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }
        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .alert {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        .alert-error {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
        }
        .alert-success {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #86efac;
        }
      `}</style>

      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginBottom: '6px',
            letterSpacing: '-0.5px'
          }}>
            NovaBoard
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, fontWeight: '500' }}>
            E-Commerce Portal
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="text-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {!isForgotPassword && (
            <div className="input-group" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="input-label" style={{ marginBottom: '0' }}>Password</label>
                <span 
                  onClick={() => { setError(''); setSuccess(''); setIsForgotPassword(true); }}
                  style={{ color: '#6366f1', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Forgot Password?
                </span>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="text-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required={!isForgotPassword}
              />
            </div>
          )}

          {isForgotPassword ? (
            <>
              <button 
                type="button" 
                onClick={handleResetPassword} 
                className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: '16px' }}
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
              <button 
                type="button" 
                onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }} 
                className="btn btn-secondary"
                disabled={loading}
              >
                Back to Login
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={handleLogin} 
                className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: '16px' }}
              >
                {loading ? 'Processing...' : 'Sign In'}
              </button>


          <button 
            type="button" 
            onClick={handleSignup} 
            className="btn btn-secondary"
            disabled={loading}
          >
            Create Customer Account
          </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}