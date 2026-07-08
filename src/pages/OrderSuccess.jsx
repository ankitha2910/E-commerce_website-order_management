import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div style={{
      background: '#F1F3F6', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 20px' }} />
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
          Order Placed Successfully!
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
          Thank you for shopping with NovaBoard. We've received your order and are currently processing it.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/shop')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
            }}
          >
            <ShoppingBag size={20} /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
