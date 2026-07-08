import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Package, Lock, MapPin, HeadphonesIcon } from 'lucide-react';

export default function AccountHub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>Loading...</div>;

  const cards = [
    {
      title: 'Your Orders',
      description: 'Track, return, or buy things again',
      icon: <Package size={48} strokeWidth={1} color="#2874F0" />,
      path: '/account/orders'
    },
    {
      title: 'Login & security',
      description: 'Edit name, mobile number, and email',
      icon: <Lock size={48} strokeWidth={1} color="#2874F0" />,
      path: '/account/edit?section=security'
    },
    {
      title: 'Your Addresses',
      description: 'Edit your default delivery address',
      icon: <MapPin size={48} strokeWidth={1} color="#2874F0" />,
      path: '/account/edit?section=address'
    },
    {
      title: 'Contact Us',
      description: 'Contact our customer service team',
      icon: <HeadphonesIcon size={48} strokeWidth={1} color="#2874F0" />,
      path: '/account/contact'
    }
  ];

  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: '#2874F0', color: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <button onClick={() => navigate('/shop')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Novaboard Account</div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '400', marginBottom: '24px', color: '#0f172a' }}>Your Account</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {cards.map((card, index) => (
            <div 
              key={index} 
              onClick={() => { if (card.path !== '#') navigate(card.path) }}
              style={{ 
                background: 'white', 
                border: '1px solid #d5d9d9', 
                borderRadius: '8px', 
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                cursor: card.path !== '#' ? 'pointer' : 'default',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { if(card.path !== '#') e.currentTarget.style.background = '#f7fafa' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
            >
              <div>{card.icon}</div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '400', margin: '0 0 4px 0', color: '#0f172a' }}>{card.title}</h2>
                <p style={{ fontSize: '14px', color: '#565959', margin: 0, lineHeight: '1.4' }}>{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
