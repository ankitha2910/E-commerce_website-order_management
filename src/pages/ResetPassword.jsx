import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is actually in a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Invalid or expired reset link. Please try resetting your password again.');
      }
    });
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password updated successfully! Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
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
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginBottom: '6px'
          }}>
            Reset Password
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, fontWeight: '500' }}>
            Enter your new secure password
          </p>
        </div>

        {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>{error}</div>}
        {success && <div style={{ padding: '12px', background: '#dcfce7', color: '#15803d', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>{success}</div>}

        <form onSubmit={handleUpdatePassword}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              style={{ width: '100%', padding: '14px', border: '2px solid #e2e8f0', borderRadius: '12px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Confirm New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              style={{ width: '100%', padding: '14px', border: '2px solid #e2e8f0', borderRadius: '12px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
