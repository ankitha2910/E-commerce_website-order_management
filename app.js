import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LogOut, Package, ShoppingCart, Users, LayoutDashboard, Plus, Search, Grid, List, Edit, Trash2, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';

const SUPABASE_URL = 'https://yrvwautokjioeetgjjuk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyd3ZhdXRva2ppb2VldGdqanVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3OTI3NzEsImV4cCI6MjA5ODM2ODc3MX0.TGlatQ_PktC9IQPPNnJhnSqEjLM5uRVEgZIsFDkmII0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

export default function App() {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, revenue: 0, lowStock: 0 });
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [productView, setProductView] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) fetchData(); }, [session]);

  const fetchData = async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    const [{ data: productsData }, { data: ordersData }, { data: customersData }] = await Promise.all([
      supabase.from('products').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      //supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      //supabase.from('customers').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);
    setProducts(productsData || []);
    setOrders(ordersData || []);
    setCustomers(customersData || []);
    const revenue = ordersData?.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0;
    const lowStock = productsData?.filter(p => p.stock < 5 && p.status === 'Active').length || 0;
    setStats({ totalProducts: productsData?.length || 0, totalOrders: ordersData?.length || 0, revenue, lowStock });
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setPage('dashboard'); };

  const handleSaveProduct = async (productData) => {
    let imageUrl = editingProduct?.image_url || '';
    //if (productData.imageFile) {
      //const fileName = `${Date.now()}_${productData.imageFile.name}`;
      //const { error } = await supabase.storage.from('products').upload(fileName, productData.imageFile);
      //if (error) { alert('Image upload failed: ' + error.message); return; }
      //imageUrl = supabase.storage.from('products').getPublicUrl(fileName).data.publicUrl;
    //}
    const dataToSave = {
      name: productData.name,
      category: productData.category,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      status: productData.status || 'Active'
    };
    if (editingProduct) await supabase.from('products').update(dataToSave).eq('id', editingProduct.id);
    else await supabase.from('products').insert([dataToSave]);
    setShowProductModal(false); setEditingProduct(null); fetchData();
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) { await supabase.from('products').delete().eq('id', id); fetchData(); }
  };

  const handleSaveCustomer = async (customerData) => {
    await supabase.from('customers').insert([{...customerData, user_id: session.user.id }]);
    setShowCustomerModal(false); fetchData();
  };

  const handleCreateOrder = async (orderData) => {
    await supabase.from('orders').insert([{...orderData, user_id: session.user.id }]);
    setShowOrderModal(false); fetchData();
  };

  const updateOrderStatus = async (orderId, status) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    fetchData();
  };

  const downloadInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(102, 126, 234); doc.text('NovaBoard', 105, 20, { align: 'center' });
    doc.setFontSize(10); doc.setTextColor(100); doc.text('E-Commerce Invoice', 105, 28, { align: 'center' });
    doc.setDrawColor(102, 126, 234); doc.line(20, 35, 190, 35);
    doc.setFontSize(12); doc.setTextColor(0);
    doc.text(`Invoice ID: ${order.id.slice(0, 8)}`, 20, 45);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 53);
    doc.text(`Customer: ${order.customer_name}`, 20, 61);
    doc.text(`Email: ${order.customer_email}`, 20, 69);
    doc.text(`Status: ${order.status}`, 20, 77);
    doc.setFontSize(14); doc.setTextColor(102, 126, 234);
    doc.text(`Total: ₹${order.total_amount}`, 20, 90);
    doc.save(`invoice_${order.id.slice(0, 8)}.pdf`);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading NovaBoard...</div>;
  if (!session) return <AuthPage />;

  const categories = [...new Set(products.map(p => p.category))];
  const filteredProducts = products.filter(p =>
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter? p.category === categoryFilter : true) &&
    (statusFilter? p.status === statusFilter : true)
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
      .sidebar { width: 260px; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); color: white; padding: 24px; display: flex; flex-direction: column; position: fixed; height: 100vh; }
      .logo { font-size: 26px; font-weight: 800; margin-bottom: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .nav-item { padding: 12px 16px; margin: 4px 0; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.2s; font-weight: 500; }
      .nav-item:hover { background: rgba(255,255,255,0.1); transform: translateX(4px); }
      .nav-item.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
      .main { flex: 1; padding: 32px; margin-left: 260px; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
      .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.3s; }
      .card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-2px); }
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
      .stat-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); position: relative; overflow: hidden; }
      .stat-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); }
      .btn { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; font-size: 14px; }
      .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
      .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(102,126,234,0.4); }
      .btn-danger { background: #ef4444; color: white; }
      .btn-success { background: #10b981; color: white; }
      .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
      .modal-content { background: white; border-radius: 20px; padding: 32px; width: 90%; max-width: 550px; max-height: 90vh; overflow-y: auto; }
        input, select, textarea { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; margin: 8px 0 16px; font-size: 14px; transition: all 0.2s; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 14px; text-align: left; border-bottom: 1px solid #f1f5f9; }
        th { font-weight: 700; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        tr:hover { background: #f8fafc; }
      .badge { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
      .badge-success { background: #dcfce7; color: #166534; }
      .badge-warning { background: #fef3c7; color: #92400e; }
      .badge-danger { background: #fee2e2; color: #991b1b; }
      .badge-info { background: #dbeafe; color: #1e40af; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
      .product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.3s; }
      .product-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-4px); }
      `}</style>
      <div className="sidebar">
        <div className="logo">NovaBoard</div>
        <div className={`nav-item ${page === 'dashboard'? 'active' : ''}`} onClick={() => setPage('dashboard')}><LayoutDashboard size={20} /> Dashboard</div>
        <div className={`nav-item ${page === 'products'? 'active' : ''}`} onClick={() => setPage('products')}><Package size={20} /> Products</div>
        <div className={`nav-item ${page === 'orders'? 'active' : ''}`} onClick={() => setPage('orders')}><ShoppingCart size={20} /> Orders</div>
        <div className={`nav-item ${page === 'customers'? 'active' : ''}`} onClick={() => setPage('customers')}><Users size={20} /> Customers</div>
        <div style={{ flex: 1 }}></div>
        <div className="nav-item" onClick={handleLogout}><LogOut size={20} /> Logout</div>
      </div>
      <div className="main">
        {page === 'dashboard' && <DashboardPage stats={stats} orders={orders} products={products} />}
        {page === 'products' && <ProductsPage products={filteredProducts} categories={categories} productView={productView} setProductView={setProductView} searchTerm={searchTerm} setSearchTerm={setSearchTerm} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onAdd={() => { setEditingProduct(null); setShowProductModal(true); }} onEdit={(p) => { setEditingProduct(p); setShowProductModal(true); }} onDelete={handleDeleteProduct} />}
        {page === 'orders' && <OrdersPage orders={orders} customers={customers} updateStatus={updateOrderStatus} downloadInvoice={downloadInvoice} onAdd={() => setShowOrderModal(true)} />}
        {page === 'customers' && <CustomersPage customers={customers} orders={orders} onAdd={() => setShowCustomerModal(true)} onView={(c) => setViewingCustomer(c)} />}
      </div>
      {showProductModal && <ProductModal product={editingProduct} categories={categories} onSave={handleSaveProduct} onClose={() => { setShowProductModal(false); setEditingProduct(null); }} />}
      {showCustomerModal && <CustomerModal onSave={handleSaveCustomer} onClose={() => setShowCustomerModal(false)} />}
      {showOrderModal && <OrderModal customers={customers} products={products} onSave={handleCreateOrder} onClose={() => setShowOrderModal(false)} />}
      {viewingCustomer && <CustomerDetailModal customer={viewingCustomer} orders={orders.filter(o => o.customer_id === viewingCustomer.id)} onClose={() => setViewingCustomer(null)} />}
    </div>
  );
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const handleSubmit = async (e) => { e.preventDefault(); setError(''); const { error } = isLogin? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password }); if (error) setError(error.message); };
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="card" style={{ width: 420, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>NovaBoard</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>E-Commerce Admin Dashboard</p>
        </div>
        <h2 style={{ marginBottom: 24, textAlign: 'center', fontWeight: 700, fontSize: 24 }}>{isLogin? 'Welcome Back' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16, padding: 12, background: '#fee2e2', borderRadius: 8 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 16 }}>{isLogin? 'Sign In' : 'Sign Up'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>{isLogin? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: '#667eea', cursor: 'pointer', fontWeight: 700 }} onClick={() => setIsLogin(!isLogin)}>{isLogin? 'Sign Up' : 'Sign In'}</span>
        </p>
      </div>
    </div>
  );
}

function DashboardPage({ stats, orders, products }) {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }).reverse();
  const chartData = last7Days.map(date => ({
    date,
    revenue: orders.filter(o => new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === date && o.status === 'Delivered')
.reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
  }));
  const categoryData = Object.values(products.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || { name: p.category, value: 0 };
    acc[p.category].value += 1;
    return acc;
  }, {}));

  return (
    <>
      <div className="header">
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Welcome back! Here's your business overview</p>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
            <div>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8, fontWeight: 600 }}>Total Products</p>
              <h3 style={{ fontSize: 36, fontWeight: 800 }}>{stats.totalProducts}</h3>
            </div>
            <div style={{ padding: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 12 }}><Package size={24} color="white" /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
            <TrendingUp size={16} /> Active inventory
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
            <div>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8, fontWeight: 600 }}>Total Orders</p>
              <h3 style={{ fontSize: 36, fontWeight: 800 }}>{stats.totalOrders}</h3>
            </div>
            <div style={{ padding: 12, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: 12 }}><ShoppingCart size={24} color="white" /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
            <TrendingUp size={16} /> All time orders
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
            <div>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8, fontWeight: 600 }}>Revenue</p>
              <h3 style={{ fontSize: 36, fontWeight: 800 }}>₹{stats.revenue.toLocaleString()}</h3>
            </div>
            <div style={{ padding: 12, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: 12 }}><TrendingUp size={24} color="white" /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, fontWeight: 600 }}>
            <TrendingUp size={16} /> Delivered orders only
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
            <div>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8, fontWeight: 600 }}>Low Stock Alert</p>
              <h3 style={{ fontSize: 36, fontWeight: 800, color: stats.lowStock > 0? '#ef4444' : '#10b981' }}>{stats.lowStock}</h3>
            </div>
            <div style={{ padding: 12, background: stats.lowStock > 0? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 12 }}><AlertTriangle size={24} color="white" /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: stats.lowStock > 0? '#ef4444' : '#10b981', fontSize: 13, fontWeight: 600 }}>
            <AlertTriangle size={16} /> {stats.lowStock > 0? 'Needs attention' : 'All stocked'}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20, fontWeight: 700, fontSize: 18 }}>Revenue Trend - Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: 'white', border: 'none', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="revenue" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs><linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#667eea" stopOpacity={1} /><stop offset="100%" stopColor="#764ba2" stopOpacity={0.8} /></linearGradient></defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 20, fontWeight: 700, fontSize: 18 }}>Products by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 20, fontWeight: 700, fontSize: 18 }}>Recent Orders</h3>
        <table>
          <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>{orders.slice(0, 5).map(order => (
            <tr key={order.id}>
              <td style={{ fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
              <td>{order.customer_name}</td>
              <td style={{ fontWeight: 600 }}>₹{order.total_amount}</td>
              <td><span className={`badge ${order.status === 'Delivered'? 'badge-success' : order.status === 'Shipped'? 'badge-info' : order.status === 'Packed'? 'badge-warning' : 'badge-danger'}`}>{order.status}</span></td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}

function ProductsPage({ products, categories, productView, setProductView, searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter, onAdd, onEdit, onDelete }) {
  return (
    <>
      <div className="header"><h1 style={{ fontSize: 36, fontWeight: 800 }}>Products</h1><button className="btn btn-primary" onClick={onAdd}><Plus size={18} /> Add Product</button></div>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: 12, marginBottom: 24 }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#94a3b8' }} />
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: 44, margin: 0 }} />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ margin: 0 }}>
            <option value="">All Categories</option>{categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ margin: 0 }}>
            <option value="">All Status</option><option>Active</option><option>Out of Stock</option>
          </select>
          <button className="btn" style={{ background: productView === 'table'? '#e2e8f0' : 'transparent', margin: 0 }} onClick={() => setProductView('table')}><List size={18} /></button>
          <button className="btn" style={{ background: productView === 'grid'? '#e2e8f0' : 'transparent', margin: 0 }} onClick={() => setProductView('grid')}><Grid size={18} /></button>
        </div>
        {productView === 'table'? (
          <table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{products.map(product => (
              <tr key={product.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={product.image_url || 'https://via.placeholder.com/50'} alt="" style={{ width: 50, height: 50, borderRadius: 10, objectFit: 'cover' }} />
                  <div><p style={{ fontWeight: 700 }}>{product.name}</p><p style={{ fontSize: 12, color: '#64748b' }}>{product.description?.slice(0, 40)}...</p></div>
                </td>
                <td>{product.category}</td><td style={{ fontWeight: 700 }}>₹{product.price}</td>
                <td><span className={`badge ${product.stock < 5? 'badge-danger' : product.stock < 20? 'badge-warning' : 'badge-success'}`}>{product.stock} units</span></td>
                <td><span className={`badge ${product.status === 'Active'? 'badge-success' : 'badge-danger'}`}>{product.status}</span></td>
                <td>
                  <button className="btn" style={{ padding: 8, marginRight: 8 }} onClick={() => onEdit(product)}><Edit size={16} /></button>
                  <button className="btn btn-danger" style={{ padding: 8 }} onClick={() => onDelete(product.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        ) : (
          <div className="grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image_url || 'https://via.placeholder.com/400x300'} alt="" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                <div style={{ padding: 20 }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 18 }}>{product.name}</h4>
                  <p style={{ color: '#64748b', fontSize: 14, marginBottom: 12, height: 40, overflow: 'hidden' }}>{product.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#667eea' }}>₹{product.price}</span>
                    <span className={`badge ${product.status === 'Active'? 'badge-success' : 'badge-danger'}`}>{product.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onEdit(product)}><Edit size={16} /> Edit</button>
                    <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onDelete(product.id)}><Trash2 size={16} /> Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function OrdersPage({ orders, customers, updateStatus, downloadInvoice, onAdd }) {
  return (
    <>
      <div className="header"><h1 style={{ fontSize: 36, fontWeight: 800 }}>Orders</h1><button className="btn btn-primary" onClick={onAdd}><Plus size={18} /> Create Order</button></div>
      <div className="card">
        <table>
          <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>{orders.map(order => (
            <tr key={order.id}>
              <td style={{ fontWeight: 600 }}>#{order.id.slice(0, 8)}</td>
              <td><div><p style={{ fontWeight: 600 }}>{order.customer_name}</p><p style={{ fontSize: 12, color: '#64748b' }}>{order.customer_email}</p></div></td>
              <td style={{ fontWeight: 700 }}>₹{order.total_amount}</td>
              <td>
                <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} style={{ padding: 8, borderRadius: 8, border: '2px solid #e2e8f0', fontSize: 13, fontWeight: 600, margin: 0 }}>
                  <option>Pending</option><option>Packed</option><option>Shipped</option><option>Delivered</option>
                </select>
              </td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
              <td><button className="btn btn-primary" onClick={() => downloadInvoice(order)}><Download size={16} /> Invoice</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
function CustomersPage({ customers, orders, onAdd, onView }) {
  return (
    <>
      <div className="header"><h1 style={{ fontSize: 36, fontWeight: 800 }}>Customers</h1><button className="btn btn-primary" onClick={onAdd}><Plus size={18} /> Add Customer</button></div>
      <div className="card">
        <table>
          <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Total Orders</th><th>Actions</th></tr></thead>
          <tbody>{customers.map(customer => (
            <tr key={customer.id}>
              <td style={{ fontWeight: 700 }}>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone || 'N/A'}</td>
              <td><span className="badge badge-info">{orders.filter(o => o.customer_id === customer.id).length} orders</span></td>
              <td><button className="btn" onClick={() => onView(customer)}>View Details</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}

function ProductModal({ product, categories, onSave, onClose }) {
  const [formData, setFormData] = useState(product || { name: '', price: '', category: '', stock: '', description: '', imageFile: null });
  const [imagePreview, setImagePreview] = useState(product?.image_url || '');
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
  const handleImageChange = (e) => { const file = e.target.files[0]; if (file) { setFormData({...formData, imageFile: file }); setImagePreview(URL.createObjectURL(file)); } };
  return (
    <div className="modal" onClick={onClose}><div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2 style={{ marginBottom: 24, fontWeight: 800, fontSize: 24 }}>{product? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Product Name</label>
        <input type="text" placeholder="Enter product name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Price</label><input type="number" step="0.01" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required /></div>
          <div><label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Stock Quantity</label><input type="number" placeholder="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required /></div>
        </div>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Category</label>
        <input type="text" list="categories" placeholder="Select or type category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
        <datalist id="categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Description</label>
        <textarea placeholder="Product description..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" />
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Product Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, marginTop: 12 }} />}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="button" className="btn" style={{ flex: 1, background: '#e2e8f0' }} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{product? 'Update Product' : 'Create Product'}</button>
        </div>
      </form>
    </div></div>
  );
}

function CustomerModal({ onSave, onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
  return (
    <div className="modal" onClick={onClose}><div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2 style={{ marginBottom: 24, fontWeight: 800, fontSize: 24 }}>Add New Customer</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Customer Name</label>
        <input type="text" placeholder="Enter customer name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Email Address</label>
        <input type="email" placeholder="customer@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Phone Number</label>
        <input type="tel" placeholder="+91 9876543210" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="button" className="btn" style={{ flex: 1, background: '#e2e8f0' }} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Customer</button>
        </div>
      </form>
    </div></div>
  );
}
function OrderModal({ customers, products, onSave, onClose }) {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const handleSubmit = (e) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === selectedCustomer);
    const product = products.find(p => p.id === selectedProduct);
    if (!customer ||!product) return alert('Select customer and product');
    onSave({ customer_id: customer.id, customer_name: customer.name, customer_email: customer.email, total_amount: (product.price * quantity).toFixed(2), status: 'Pending' });
  };
  return (
    <div className="modal" onClick={onClose}><div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2 style={{ marginBottom: 24, fontWeight: 800, fontSize: 24 }}>Create New Order</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Select Customer</label>
        <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required>
          <option value="">Choose a customer...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.email}</option>)}
        </select>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Select Product</label>
        <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required>
          <option value="">Choose a product...</option>{products.filter(p => p.status === 'Active').map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price} (Stock: {p.stock})</option>)}
        </select>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Quantity</label>
        <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} required />
        {selectedProduct && <div style={{ padding: 16, background: '#f1f5f9', borderRadius: 12, marginBottom: 16 }}>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>Order Summary</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#667eea' }}>Total: ₹{(products.find(p => p.id === selectedProduct)?.price * quantity).toFixed(2)}</p>
        </div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="button" className="btn" style={{ flex: 1, background: '#e2e8f0' }} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Order</button>
        </div>
      </form>
    </div></div>
  );
}