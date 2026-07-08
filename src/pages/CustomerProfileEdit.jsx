import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft } from 'lucide-react';

export default function CustomerProfileEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const section = searchParams.get('section') || 'security';

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    mobile_number: '',
    address: ''
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });
  }, [navigate]);

  const fetchProfile = async (userId) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) {
      setFormData({
        username: profile.username || '',
        mobile_number: profile.mobile_number !== 'N/A' ? profile.mobile_number : '',
        address: profile.address || ''
      });
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      username: formData.username,
      mobile_number: formData.mobile_number,
      address: formData.address
    }).eq('id', user.id);
    
    setSaving(false);
    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      navigate('/account');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>Loading...</div>;

  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: '#2874F0', color: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <button onClick={() => navigate('/account')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.3)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ fontSize: '20px', fontWeight: '600' }}>{section === 'address' ? 'Your Addresses' : 'Login & Security'}</div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
           <div style={{ width: '48px', height: '48px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {section === 'address' ? (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             ) : (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
             )}
           </div>
           <div>
             <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0', color: '#0f172a' }}>{section === 'address' ? 'Your Addresses' : 'Login & Security'}</h1>
             <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>{section === 'address' ? 'Manage where your orders get delivered.' : 'Update your personal details to keep your account secure.'}</p>
           </div>
        </div>
        
        <form onSubmit={handleSave} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          
          {section === 'security' && (
            <>
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '8px', color: '#334155' }}>Full Name</label>
                <input 
                  type="text" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  placeholder="John Doe"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc' }} 
                  onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '8px', color: '#334155' }}>Mobile Phone Number</label>
                <input 
                  type="text" 
                  value={formData.mobile_number} 
                  onChange={(e) => setFormData({...formData, mobile_number: e.target.value})} 
                  placeholder="+1 (555) 000-0000"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc' }} 
                  onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Used to assist with order delivery and account recovery.
                </p>
              </div>
            </>
          )}

          {section === 'address' && (
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '8px', color: '#334155' }}>Default Delivery Address</label>
              <textarea 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', minHeight: '120px', resize: 'vertical', transition: 'border-color 0.2s', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }} 
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                placeholder="E.g. 123 Commerce Avenue, Tech District, CA 90210"
                required
              />
              <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 0 0' }}>Please ensure the address is accurate to avoid shipping delays.</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <button type="submit" disabled={saving} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer', flex: 1, boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)', transition: 'background 0.2s, transform 0.1s' }} onMouseEnter={e => e.currentTarget.style.background='#4338ca'} onMouseLeave={e => e.currentTarget.style.background='#4f46e5'} onMouseDown={e => e.currentTarget.style.transform='scale(0.98)'} onMouseUp={e => e.currentTarget.style.transform='scale(1)'}>
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/account')} style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', flex: 1, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background='#f1f5f9'}>
              Discard
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
