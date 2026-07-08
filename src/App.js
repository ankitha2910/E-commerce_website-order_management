import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './pages/auth';     
import Admin from './pages/admin';   
import Shop from './pages/shop'; 
import Checkout from './components/checkout';
import ProductDetail from './components/ProductDetail';
import Orders from './components/Orders';
import Customers from './pages/Customers';     
import Login from './components/login'; // Import the new Login component
import OrderSuccess from './pages/OrderSuccess';
import AccountHub from './pages/AccountHub';
import CustomerOrders from './pages/CustomerOrders';
import CustomerProfileEdit from './pages/CustomerProfileEdit';
import ContactUs from './pages/ContactUs';
import ResetPassword from './pages/ResetPassword';
import { CartProvider } from './context/CartContext';

// Dynamic dashboard route resolver
function DashboardRedirect() {
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setDestination('/login');
        setLoading(false);
        return;
      }
      
      const user = session.user;
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      const role = profile?.role || user.user_metadata?.role || 'customer';
      if (role === 'admin') {
        setDestination('/admin');
      } else {
        setDestination('/shop');
      }
      setLoading(false);
    };
    checkRole();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white', fontFamily: "'Inter', sans-serif" }}>
        Loading your dashboard...
      </div>
    );
  }
  return <Navigate to={destination} replace />;
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<Admin />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<OrderSuccess />} />
          <Route path="/product/:id" element={user ? <ProductDetail /> : <Navigate to="/login" />} />
          <Route path="/account" element={user ? <AccountHub /> : <Navigate to="/login" />} />
          <Route path="/account/orders" element={user ? <CustomerOrders /> : <Navigate to="/login" />} />
          <Route path="/account/edit" element={user ? <CustomerProfileEdit /> : <Navigate to="/login" />} />
          <Route path="/account/contact" element={user ? <ContactUs /> : <Navigate to="/login" />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;