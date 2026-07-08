import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup
  const [selectedRole, setSelectedRole] = useState('customer'); // 'customer' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic Validation
    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isLogin && (!fullName.trim() || !mobileNumber.trim())) {
      setError('Full Name and Mobile Number are required for Sign Up.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          console.error("Login Auth Error:", authError);
          let rawMsg = authError.message || authError.error_description || JSON.stringify(authError);
          if (typeof rawMsg === 'object') rawMsg = JSON.stringify(rawMsg);
          if (rawMsg === '{}' || !rawMsg) rawMsg = 'An unexpected error occurred during login.';
          
          const errMsg = rawMsg.toLowerCase();
          if (errMsg.includes('invalid login') || errMsg.includes('invalid credentials')) {
            setError('Invalid Email or Password');
          } else {
            setError(rawMsg);
          }
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Check role from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          const dbRole = profile?.role || data.user.user_metadata?.role || 'customer';

          // Role mismatch validation
          if (selectedRole !== dbRole) {
            setError(`You are not a ${selectedRole === 'admin' ? 'Admin' : 'Customer'}`);
            await supabase.auth.signOut(); // Log out invalid session
            setLoading(false);
            return;
          }

          setSuccess('Login Successful! Redirecting...');
          setTimeout(() => {
            if (dbRole === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/dashboard');
            }
          }, 1000);
        }
      } else {
        // --- SIGNUP LOGIC ---
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              fullName,
              mobile: mobileNumber,
              role: selectedRole,
            },
          },
        });

        if (authError) {
          console.error("Signup Auth Error:", authError);
          let rawMsg = authError.message || authError.error_description || JSON.stringify(authError);
          if (typeof rawMsg === 'object') rawMsg = JSON.stringify(rawMsg);
          if (rawMsg === '{}' || !rawMsg) rawMsg = 'Sign up failed due to a server error. Please try again.';
          
          const errMsg = rawMsg.toLowerCase();
          if (errMsg.includes('already registered') || errMsg.includes('already exists') || errMsg.includes('email_exists')) {
            setError('This email is already registered. Please login instead');
          } else if (errMsg.includes('password')) {
            setError('Password should be at least 6 characters');
          } else if (errMsg.includes('rate limit')) {
            setError('Too many signups recently. Please try again in an hour, or log in with an existing account.');
          } else if (errMsg.includes('invalid email') || errMsg.includes('valid email')) {
            setError('Please enter a valid email address');
          } else {
            setError(rawMsg);
          }
        } else if (data?.user) {
          // Insert into profiles table
          const { error: profileErr } = await supabase.from('profiles').insert([
            { 
              id: data.user.id, 
              name: fullName, 
              mobile: mobileNumber, 
              email, 
              role: selectedRole 
            }
          ]);

          // Fallback if profiles table doesn't support name/mobile/email columns
          if (profileErr && (profileErr.code === '42703' || profileErr.message.includes('column'))) {
            await supabase.from('profiles').insert([
              { id: data.user.id, role: selectedRole, username: fullName }
            ]);
          }

          // If customer, also register in customers table
          if (selectedRole === 'customer') {
            await supabase.from('customers').insert([
              { id: data.user.id, name: fullName, email, phone: mobileNumber, user_id: data.user.id }
            ]);
          }

          if (!data.session) {
            setSuccess('Account created! Please check your email inbox to verify your account.');
            setTimeout(() => {
              setIsLogin(true);
              setSuccess('');
            }, 4000);
          } else {
            setSuccess('Account Created Successfully');
            setTimeout(() => {
              if (selectedRole === 'admin') {
                navigate('/admin/dashboard');
              } else {
                navigate('/dashboard');
              }
            }, 1000);
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setError('');
    setSuccess('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform hover:scale-[1.01]">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-10 text-white text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">NovaBoard</h1>
          <p className="text-blue-100 text-sm font-medium">E-Commerce Control Portal</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAuth} className="p-8">
          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span className="break-words w-full">{typeof error === 'object' ? JSON.stringify(error) : error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{success}</span>
            </div>
          )}

          {/* Login As Dropdown */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Login As</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="customer">👤 Customer</option>
              <option value="admin">👨‍💼 Admin</option>
            </select>
          </div>

          {/* Signup Specific Fields */}
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(''); }}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => { setMobileNumber(e.target.value); setError(''); }}
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </>
          )}

          {/* Common Fields */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email ID</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {!isForgotPassword && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                {isLogin && (
                  <span 
                    onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                disabled={loading}
                required={!isForgotPassword}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          )}

          {/* Action Button */}
          {isForgotPassword ? (
            <>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }}
                disabled={loading}
                className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center"
              >
                Back to Login
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? (
                selectedRole === 'admin' ? 'Login as Admin' : 'Login as Customer'
              ) : (
                selectedRole === 'admin' ? 'Create Admin Account' : 'Create Customer Account'
              )}
            </button>
          )}

          {/* Helper Toggle Link */}
          <p className="text-center mt-6 text-sm text-gray-500 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={toggleMode}
              className="text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}