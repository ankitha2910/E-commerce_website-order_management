import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Download, ShoppingBag } from 'lucide-react';
import jsPDF from 'jspdf';

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
        fetchOrders(session.user.id);
      }
    });
  }, [navigate]);

  const fetchOrders = async (userId) => {
    // 1. Fetch by user_id (new orders will have this)
    const { data: idOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);
    
    // 2. Fetch by phone (fallback for old orders placed without user_id)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    
    // Also try to get phone from user metadata if profile is missing
    const { data: { session } } = await supabase.auth.getSession();
    const phone = profile?.mobile_number || session?.user?.user_metadata?.mobile_number;

    let phoneOrders = [];
    if (phone) {
      const { data } = await supabase.from('orders').select('*').eq('phone', phone);
      phoneOrders = data || [];
    }
    
    // 3. Combine, remove duplicates, and sort
    const allOrders = [...(idOrders || []), ...phoneOrders];
    const uniqueOrders = Array.from(new Map(allOrders.map(o => [o.id, o])).values());
    uniqueOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setOrders(uniqueOrders);
    setLoading(false);
  };

  const downloadInvoice = (order) => {
    const invoiceNo = String(order.id || 'N/A').slice(0,8);
    const calculatedTotal = order.items ? order.items.reduce((sum, item) => sum + (item.price * item.qty), 0) : order.total_amount;
    
    const doc = new jsPDF(); 
    doc.setFontSize(22); 
    doc.text('INVOICE', 105, 20, { align: 'center' });
    doc.setFontSize(10); 
    doc.text(`Invoice ID: ${invoiceNo}`, 20, 45); 
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 53);
    doc.text(`Customer: ${order.customer_name || user?.username || 'Customer'}`, 20, 61); 
    doc.text(`Status: ${order.status || 'Pending'}`, 20, 77); 
    doc.text(`Total: INR ${calculatedTotal}`, 20, 90); 
    
    doc.save(`Invoice-${invoiceNo}.pdf`);
  };

  const renderOrderTimeline = (status) => {
    const statuses = ['Pending', 'Packed', 'Shipped', 'Delivered'];
    const currentIndex = statuses.indexOf(status) === -1 ? 0 : statuses.indexOf(status);
    
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0 20px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '4px', background: '#e2e8f0', zIndex: 1 }}>
           <div style={{ height: '100%', background: '#388E3C', width: `${(currentIndex / 3) * 100}%`, transition: 'width 0.5s ease' }}></div>
        </div>
        {statuses.map((step, idx) => (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx <= currentIndex ? '#388E3C' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', border: '4px solid white', boxShadow: '0 0 0 1px #e2e8f0' }}>
               {idx < currentIndex ? '✓' : (idx + 1)}
            </div>
            <span style={{ fontSize: '12px', fontWeight: idx <= currentIndex ? '700' : '500', color: idx <= currentIndex ? '#1e293b' : '#94a3b8' }}>{step}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>Loading...</div>;

  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: '#2874F0', color: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <button onClick={() => navigate('/account')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Your Orders</div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '400', margin: 0, color: '#0f172a' }}>Your Orders</h1>
        </div>
        
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', border: '1px solid #d5d9d9', borderRadius: '8px' }}>
            <ShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '18px', color: '#333' }}>Looks like you haven't placed an order!</h2>
            <button onClick={() => navigate('/shop')} style={{ marginTop: '20px', padding: '10px 20px', background: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Start Shopping</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.map(order => {
              const calculatedTotal = order.items ? order.items.reduce((sum, item) => sum + (item.price * item.qty), 0) : order.total_amount;
              return (
                <div key={order.id} style={{ background: 'white', border: '1px solid #d5d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                  
                  {/* ORDER HEADER */}
                  <div style={{ background: '#f0f2f2', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #d5d9d9', fontSize: '14px' }}>
                    <div style={{ display: 'flex', gap: '30px' }}>
                      <div>
                        <div style={{ color: '#565959', marginBottom: '4px', textTransform: 'uppercase', fontSize: '12px' }}>Order Placed</div>
                        <div style={{ color: '#0f172a' }}>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                      <div>
                        <div style={{ color: '#565959', marginBottom: '4px', textTransform: 'uppercase', fontSize: '12px' }}>Total</div>
                        <div style={{ color: '#0f172a' }}>₹{calculatedTotal.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ color: '#565959', marginBottom: '4px', textTransform: 'uppercase', fontSize: '12px' }}>Ship To</div>
                        <div style={{ color: '#007185', cursor: 'pointer' }}>{order.customer_name || 'Customer'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#565959', marginBottom: '4px', textTransform: 'uppercase', fontSize: '12px' }}>Order # {order.id.toString().slice(0,8)}</div>
                      <div onClick={() => downloadInvoice(order)} style={{ color: '#007185', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <Download size={14} /> Invoice
                      </div>
                    </div>
                  </div>

                  {/* ORDER BODY */}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: order.status === 'Delivered' ? '#067D62' : '#C45500' }}>
                      {order.status === 'Delivered' ? 'Delivered' : `Arriving soon - ${order.status}`}
                    </h3>
                    
                    {renderOrderTimeline(order.status || 'Pending')}

                    <div style={{ borderTop: '1px solid #f0f2f2', marginTop: '24px', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {order.items && order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ width: '90px', height: '90px', background: '#f8fafc', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={item.image_url} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#007185', fontWeight: '500', fontSize: '14px', marginBottom: '4px', cursor: 'pointer' }} onClick={() => navigate(`/product/${item.id}`)}>{item.name}</div>
                            <div style={{ color: '#565959', fontSize: '12px', marginBottom: '8px' }}>Qty: {item.qty}</div>
                            <div style={{ color: '#B12704', fontWeight: '700', fontSize: '14px' }}>₹{item.price.toLocaleString('en-IN')}</div>
                          </div>
                          <div>
                            <button onClick={() => navigate(`/product/${item.id}`)} style={{ width: '150px', padding: '6px 12px', background: 'white', border: '1px solid #d5d9d9', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', boxShadow: '0 2px 5px rgba(15,17,17,0.15)' }}>Write a product review</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
