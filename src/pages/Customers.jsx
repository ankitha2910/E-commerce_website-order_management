import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchCustomersWithOrders();
  }, []);

  const fetchCustomersWithOrders = async () => {
    setLoading(true);
    
    // 1. Fetch all customers from profiles table where role = 'customer'
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.log('Fetch Profiles Error:', profilesError);
      setLoading(false);
      return;
    }

    // 2. Fetch all orders from orders table
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*');

    if (ordersError) {
      console.log('Fetch Orders Error:', ordersError);
      setLoading(false);
      return;
    }

    // 3. Remove duplicate customers by email
    const uniqueCustomers = [...new Map((profilesData || []).map(c => [c.email, c])).values()];

    // 4. Calculate stats for each unique customer
    const customersWithStats = uniqueCustomers.map((customer) => {
      // Find all orders for this specific customer using user_id
      const customerOrders = (ordersData || []).filter(order => order.user_id === customer.id);
      
      const totalOrders = customerOrders.length;
      const totalSpent = customerOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

      return { 
        ...customer, 
        name: customer.name || customer.email, 
        mobile: customer.mobile || customer.mobile_number || 'N/A',
        address: customer.address || 'N/A',
        totalOrders, 
        totalSpent 
      };
    });

    setCustomers(customersWithStats);
    setLoading(false);
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();

    // Since we fetch from profiles, we should insert into profiles 
    // (though technically standard auth signup is better, but keeping functionality as requested)
    // We'll insert with role='customer'
    const { error } = await supabase
      .from('profiles')
      .insert([{
        id: crypto.randomUUID(), // Assuming UUID is needed if no auth linkage
        email: formData.email,
        username: formData.name,
        mobile_number: formData.phone,
        role: 'customer'
      }]);

    if (error) {
      alert('Error: ' + error.message);
      console.log(error);
    } else {
      alert('Customer Added Successfully!');
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
      fetchCustomersWithOrders();
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };
  
  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this customer?")){
      await supabase.from('profiles').delete().eq('id', id);
      fetchCustomersWithOrders();
    }
  }

  return (
    <div style={{ padding: '32px 40px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Customers</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Manage your customer database and view their purchasing history.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
          onMouseEnter={e => e.currentTarget.style.background='#4338ca'} 
          onMouseLeave={e => e.currentTarget.style.background='#4f46e5'}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
          Add Customer
        </button>
      </div>

      {/* Customer Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Loading customers & orders...</p>
        </div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <svg style={{ margin: '0 auto 16px', color: '#cbd5e1' }} width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>No customers yet. Click "Add Customer" to add one.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Total Orders</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Spent</th>
                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='#f8fafc'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>{cust.name}</td>
                  <td style={{ padding: '16px 24px' }}>
                     <div style={{ color: '#334155', fontSize: '14px', marginBottom: '4px' }}>{cust.email}</div>
                     <div style={{ color: '#64748b', fontSize: '13px' }}>{cust.mobile}</div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cust.address}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '700', color: '#0f172a', fontSize: '15px', textAlign: 'center' }}>
                     <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>{cust.totalOrders}</span>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: '800', color: '#16a34a', fontSize: '15px' }}>₹{cust.totalSpent.toFixed(2)}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(cust.id)}
                      style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#fee2e2'}
                      onMouseLeave={e => e.currentTarget.style.background='#fef2f2'}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 24px 0' }}>Add New Customer</h2>
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Full Name</label>
                 <input
                   type="text"
                   name="name"
                   required
                   value={formData.name}
                   onChange={handleChange}
                   style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc' }}
                   onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                   onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                 />
              </div>
              <div>
                 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Email Address</label>
                 <input
                   type="email"
                   name="email"
                   value={formData.email}
                   onChange={handleChange}
                   style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc' }}
                   onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                   onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                 />
              </div>
              <div>
                 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Phone Number</label>
                 <input
                   type="text"
                   name="phone"
                   value={formData.phone}
                   onChange={handleChange}
                   style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc' }}
                   onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                   onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                 />
              </div>
              <div>
                 <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Address</label>
                 <textarea
                   name="address"
                   rows="3"
                   value={formData.address}
                   onChange={handleChange}
                   style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', minHeight: '80px', resize: 'vertical', transition: 'border-color 0.2s', background: '#f8fafc' }}
                   onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                   onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                 ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#334155', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.background='#f1f5f9'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, background: '#4f46e5', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.background='#4338ca'}
                  onMouseLeave={e => e.currentTarget.style.background='#4f46e5'}
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}