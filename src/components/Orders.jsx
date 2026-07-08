import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { fetchOrders(); }, []);
  
  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('id', {ascending: false});
    setOrders(data || []);
  }

  return (
    <div style={{background: '#F1F3F6', minHeight: '100vh', padding: '20px'}}>
      <h1 style={{textAlign: 'center', marginBottom: '20px'}}>My Orders</h1>
      {orders.length === 0 ? 
        <p style={{textAlign: 'center'}}>No orders yet</p> :
        orders.map(order => (
          <div key={order.id} style={{background: 'white', padding: '20px', marginBottom: '15px', borderRadius: '8px', maxWidth: '800px', margin: '0 auto 15px'}}>
            <p><b>Order ID:</b> #{order.id}</p>
            <p><b>Name:</b> {order.customer_name}</p>
            <p><b>Phone:</b> {order.phone}</p>
            <p><b>Address:</b> {order.address}</p>
            <p><b>Total:</b> ₹{order.total}</p>
            <p><b>Payment:</b> {order.payment_mode}</p>
            <p><b>Status:</b> <span style={{color: 'green'}}>Confirmed</span></p>
          </div>
        ))
      }
    </div>
  )
}