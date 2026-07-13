import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LogOut, Package, ShoppingCart, Users, LayoutDashboard, Plus, Search, Grid, List, Edit, Trash2, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';

const SUPABASE_URL = 'https://zzcrhiawxhrdwnwauape.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Y3JoaWF3eGhyZHdud2F1YXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODM2ODIsImV4cCI6MjA5ODQ1OTY4Mn0.S5a5xMjPqqmlGUilX5BqrYCwEl0NOLyyRE3G5XFXcD4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

export default function App() {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [productData, setProductData] = useState([]);
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false);
    });
    const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user) return;
      const user = session.user;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setCurrentUser({
        id: user.id,
        email: user.email,
        username: profile?.username || user.user_metadata?.username || user.email.split('@')[0],
        mobile_number: profile?.mobile_number || user.user_metadata?.mobile_number || 'N/A',
        role: profile?.role || user.user_metadata?.role || 'admin'
      });
    };
    if (session) fetchUserProfile();
    else setCurrentUser(null);
  }, [session]);

  useEffect(() => { if (session) fetchData(); }, [session]);

  const fetchData = async () => {
    const { data: productsData } = await supabase.from('products').select('*').order('id', { ascending: false });
    const { data: ordersData } = await supabase.from('orders').select('*').order('id', { ascending: false });
    const { data: customersData } = await supabase.from('customers').select('*').order('id', { ascending: false });

    setProductData(productsData || []);
    setOrders(ordersData || []);
    setCustomers(customersData || []);

    const revenueOrders = ordersData?.filter(o => o.status !== 'Cancelled') || [];
    const revenue = revenueOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const lowStock = productsData?.filter(p => p.stock_quantity < 10).length || 0;
    
    setStats({ 
      totalProducts: productsData?.length || 0, 
      totalOrders: ordersData?.length || 0, 
      revenue, 
      lowStock 
    });
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setPage('dashboard'); };

  // --- FIXED IMAGE UPLOAD FUNCTION ---
  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 1. Upload chey
    const { error: uploadError } = await supabase.storage
     .from('products-image') // nee bucket peru idhe
     .upload(fileName, file, { upsert: false });

    if (uploadError) {
      alert('Upload error: ' + uploadError.message);
      return null;
    }

    // 2. Public URL teesko - IKKADA AWAIT ADD CHEY
    const { data } = supabase.storage.from('products-image').getPublicUrl(fileName);
    
    console.log("Generated URL:", data.publicUrl); // debug kosam
    return data.publicUrl;
};

  const handleSaveProduct = async (productData, file) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Login avvaledu bro");

    let imageUrl = productData.image_url || null;
    if (file) {
      imageUrl = await uploadImage(file);
      if (!imageUrl) return alert('Image upload fail ayyindi');
    }

    console.log("Saving URL:", imageUrl);

    const dataToSave = {
      name: productData.name,
      description: productData.description,
      price: Number(productData.price),
      stock_quantity: Number(productData.stock_quantity), // DB column name
      category: productData.category, // DB lo category unte idhi use chey
      status: productData.status || 'active',
      user_id: user.id,
      image_url: imageUrl
    };

    let error;
    if (productData.id) {
      ({ error } = await supabase.from('products').update(dataToSave).eq('id', productData.id));
    } else {
      ({ error } = await supabase.from('products').insert([dataToSave]));
    }

    if (error) return alert('Error: ' + error.message);

    setShowProductModal(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
    fetchData(); // list refresh
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };
  const handleSaveCustomer = async (customerData) => { await supabase.from('customers').insert([{...customerData, user_id: session.user.id }]); setShowCustomerModal(false); fetchData(); };
  const handleCreateOrder = async (orderData) => { 
  // total calculate cheyi
    const total = orderData.items.reduce((sum, item) => sum + (item.price * item.qty), 0)
    
    await supabase.from('orders').insert([{
      ...orderData, 
      user_id: session.user.id,
      total_amount: total, // <-- IDHI ADD CHEYI
      status: 'Pending' // <-- Status kuda add cheyi
    }])
    alert('Order Created Successfully!')
    fetchData()
  }
  const updateOrderStatus = async (orderId, status) => { 
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select(); 
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Order not found or update not permitted by security policies.");
    fetchData(); 
  };

  const downloadInvoice = (order) => {
    const invoiceNo = String(order.id || 'N/A').slice(0,8)
    
    // Items nundi total calculate cheyadam
    const calculatedTotal = order.items ? order.items.reduce((sum, item) => sum + (item.price * item.qty), 0) : order.total_amount
    
    const doc = new jsPDF(); 
    doc.setFontSize(22); 
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10); 
    doc.text(`Invoice ID: ${invoiceNo}`, 20, 45); 
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 53);
    doc.text(`Customer: ${order.customer_name}`, 20, 61); 
    doc.text(`Status: ${order.status || 'Pending'}`, 20, 77); 
    doc.text(`Total: ₹${calculatedTotal}`, 20, 90); // <-- calculatedTotal use chesam
    
    doc.save(`Invoice-${invoiceNo}.pdf`);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div><span style={{ marginLeft: 16, fontSize: 18, color: 'var(--text-muted)', fontWeight: 600 }}>Loading Dashboard...</span></div>;
  if (!session) return <><GlobalStyle /><AuthPage /></>;

  const categories = [...new Set(productData.map(p => p.category))];
  const filteredProducts = productData.filter(p =>
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter? p.category === categoryFilter : true) && (statusFilter? p.status === statusFilter : true)
  );

  return (
    <><GlobalStyle />
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>
      <div className="sidebar">
        <div className="logo">NovaBoard</div>
        <div className={`nav-item ${page === 'dashboard'? 'active' : ''}`} onClick={() => setPage('dashboard')}><LayoutDashboard size={20} /> Dashboard</div>
        <div className={`nav-item ${page === 'products'? 'active' : ''}`} onClick={() => setPage('products')}><Package size={20} /> Products</div>
        <div className={`nav-item ${page === 'orders'? 'active' : ''}`} onClick={() => setPage('orders')}><ShoppingCart size={20} /> Orders</div>
        <div className={`nav-item ${page === 'customers'? 'active' : ''}`} onClick={() => setPage('customers')}><Users size={20} /> Customers</div>
        <div style={{ flex: 1 }}></div>
        {currentUser && (
          <div 
            className="nav-item" 
            onClick={() => setShowProfileModal(true)}
            style={{ 
              marginTop: 'auto', 
              borderTop: '1px solid rgba(255,255,255,0.1)', 
              paddingTop: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              cursor: 'pointer' 
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '900',
              fontSize: '16px',
              flexShrink: 0
            }}>
              {currentUser.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser.username}
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                View Profile
              </span>
            </div>
          </div>
        )}
        <div className="nav-item" onClick={handleLogout}><LogOut size={20} /> Logout</div>
      </div>
      <div className="main">
        {page === 'dashboard' && <DashboardPage stats={stats} orders={orders} products={productData} />}
        {page === 'products' && <ProductsPage products={filteredProducts} categories={categories} productView={productView} setProductView={setProductView} searchTerm={searchTerm} setSearchTerm={setSearchTerm} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onAdd={() => { setEditingProduct(null); setImageFile(null); setImagePreview(null); setShowProductModal(true); }} onEdit={(p) => { setEditingProduct(p); setImagePreview(p.image_url); setShowProductModal(true); }} onDelete={handleDeleteProduct} />}
        {page === 'orders' && <OrdersPage orders={orders} customers={customers} updateStatus={updateOrderStatus} downloadInvoice={downloadInvoice} onAdd={() => setShowOrderModal(true)} />}
        {page === 'customers' && <CustomersPage customers={customers} orders={orders} onAdd={() => setShowCustomerModal(true)} onView={(c) => setViewingCustomer(c)} />}
      </div>
      {showProductModal && <ProductModal product={editingProduct} categories={categories} onSave={handleSaveProduct} onClose={() => { setShowProductModal(false); setEditingProduct(null); setImageFile(null); setImagePreview(null); }} imageFile={imageFile} setImageFile={setImageFile} imagePreview={imagePreview} setImagePreview={setImagePreview} />}
      {showCustomerModal && <CustomerModal onSave={handleSaveCustomer} onClose={() => setShowCustomerModal(false)} />}
      {showOrderModal && <OrderModal customers={customers} products={productData} onSave={handleCreateOrder} onClose={() => setShowOrderModal(false)} />}
      {viewingCustomer && <CustomerDetailModal customer={viewingCustomer} orders={orders.filter(o => o.user_id === viewingCustomer.id)} onClose={() => setViewingCustomer(null)} />}
      {showProfileModal && currentUser && <ProfileDetailModal user={currentUser} onClose={() => setShowProfileModal(false)} />}
    </div></>
  );
}

const CustomSelect = ({ value, onChange, options, placeholder, className, style, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      <div 
        className={`border-2 border-indigo-500 bg-white text-gray-800 hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer px-4 py-2 min-w-[160px] rounded-lg shadow-sm transition-all duration-200 flex justify-between items-center ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        style={style}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="truncate mr-4">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="text-indigo-500 text-xs">▼</span>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-indigo-100 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
          {placeholder && (
            <div 
              className="px-4 py-3 cursor-pointer hover:bg-indigo-50 text-gray-700 border-b border-gray-100 font-semibold"
              onClick={() => { onChange(''); setIsOpen(false); }}
            >
              {placeholder}
            </div>
          )}
          {options.map((opt) => (
            <div 
              key={opt.value}
              className="px-4 py-3 cursor-pointer hover:bg-indigo-50 text-gray-700 border-b border-gray-50 last:border-0"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function GlobalStyle() {
  return <style>{`
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: var(--bg-main); color: var(--text-main); }
   .sidebar { width: 260px; background: var(--bg-surface); border-right: 1px solid var(--glass-border); padding: 24px; display: flex; flex-direction: column; position: fixed; height: 100vh; }
   .logo { font-size: 28px; font-weight: 900; margin-bottom: 40px; background: var(--gradient-brand); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: var(--shadow-glow); }
   .nav-item { padding: 14px 18px; margin: 6px 0; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 14px; transition: all 0.2s; font-weight: 600; color: var(--text-muted); }
   .nav-item:hover { background: rgba(255,255,255,0.05); color: white; transform: translateX(4px); }
   .nav-item.active { background: rgba(99, 102, 241, 0.1); color: var(--primary-accent); border: 1px solid rgba(99, 102, 241, 0.2); }
   .main { flex: 1; padding: 32px; margin-left: 260px; }
   .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
   .card { background: var(--bg-surface); border-radius: 20px; padding: 28px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); transition: all 0.3s; border: 1px solid var(--glass-border); }
   .card:hover { border-color: rgba(99, 102, 241, 0.2); transform: translateY(-4px); }
   .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-bottom: 32px; }
   .stat-card { background: var(--bg-surface); border-radius: 20px; padding: 28px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); position: relative; overflow: hidden; border: 1px solid var(--glass-border); }
   .stat-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: var(--gradient-brand); }
   .btn { padding: 12px 24px; border-radius: 12px; border: none; cursor: pointer; font-weight: 700; display: inline-flex; align-items: center; gap: 10px; transition: all 0.2s; font-size: 14px; color: white; }
   .btn-primary { background: var(--gradient-brand); box-shadow: var(--shadow-glow); }
   .btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-glow-strong); }
   .btn-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
   .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
   .modal-content { background: var(--bg-surface); color: white; border-radius: 24px; padding: 36px; width: 90%; max-width: 580px; max-height: 90vh; overflow-y: auto; border: 1px solid var(--glass-border); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
    input, select, textarea { width: 100%; padding: 14px 18px; background: rgba(255,255,255,0.03); color: white; border: 1px solid var(--glass-border); border-radius: 12px; margin: 10px 0 18px; font-size: 15px; transition: all 0.2s; font-family: 'Inter'; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary-accent); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }
    table { width: 100%; border-collapse: collapse; color: var(--text-main); }
    th, td { padding: 16px; text-align: left; border-bottom: 1px solid var(--glass-border); }
    th { font-weight: 800; color: var(--text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; }
    tr:hover { background: rgba(255,255,255,0.02); }
   .badge { padding: 7px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; }
   .badge-success { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
   .badge-warning { background: rgba(234, 179, 8, 0.1); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.2); }
   .badge-danger { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
   .badge-info { background: rgba(99, 102, 241, 0.1); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); }
   .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
   .product-card { background: var(--bg-surface); border-radius: 20px; overflow: hidden; transition: all 0.3s; border: 1px solid var(--glass-border); }
   .product-card:hover { box-shadow: var(--shadow-glow); transform: translateY(-6px); border-color: rgba(99, 102, 241, 0.3); }

   @media (max-width: 768px) {
     .sidebar { width: 100%; height: auto; position: static; padding: 16px; flex-direction: row; flex-wrap: wrap; justify-content: space-between; align-items: center; border-right: none; border-bottom: 1px solid var(--glass-border); }
     .sidebar .nav-item { padding: 8px 12px; margin: 4px; font-size: 14px; }
     .sidebar .logo { margin-bottom: 0; font-size: 20px; }
     .main { margin-left: 0; padding: 16px; }
     .header { flex-direction: column; align-items: flex-start; gap: 16px; }
     .stats-grid { grid-template-columns: 1fr; gap: 16px; }
     .card { padding: 16px; overflow-x: auto; }
     table { min-width: 600px; }
     .modal-content { width: 95%; padding: 20px; }
   }
  `}</style>;
}

// Remaining components same as yours - AuthPage, DashboardPage, ProductsPage, OrdersPage, CustomersPage, CustomerModal, OrderModal, CustomerDetailModal

function ProductModal({ product, categories, onSave, onClose, imageFile, setImageFile, imagePreview, setImagePreview }) {
  const [form, setForm] = useState(product || { name: '', description: '', price: '', stock_quantity: '', category: categories[0] || '', status: 'active', image_url: '' });

  useEffect(() => {
    if (product) {
      setForm(product);
      setImagePreview(product.image_url); // edit lo old image chupisthundi
    } else {
      setForm({ name: '', description: '', price: '', stock_quantity: '', category: categories[0] || '', status: 'active', image_url: '' });
      setImagePreview(null);
    }
  }, [product, categories, setImagePreview]);
  
  const handleImage = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form, imageFile);
  };

  return (
    <div className="modal" onClick={onClose}><div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2 style={{ marginBottom: 28, fontWeight: 800, fontSize: 26 }}>{product? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit}>
        {imagePreview && <img src={imagePreview} alt="" style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 16, marginBottom: 20 }} />}
        <label style={{ fontWeight: 700, fontSize: 14, color: '#475569' }}>Product Image</label>
        <input type="file" accept="image/*" onChange={handleImage} style={{ padding: 12 }} />
        <input type="text" placeholder="Product Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value })} rows={4} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <input type="number" step="0.01" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({...form, price: e.target.value })} required />
          <input type="number" placeholder="Stock Quantity" value={form.stock_quantity} onChange={(e) => setForm({...form, stock_quantity: e.target.value })} required />
        </div>
        <label className="block text-sm font-medium">Category</label>
        <CustomSelect
          value={form.category}
          onChange={(val) => setForm({...form, category: val})}
          placeholder="Select Category"
          options={[
            { label: 'Electronics', value: 'Electronics' },
            { label: 'Fashion', value: 'Fashion' },
            { label: 'Home & Kitchen', value: 'Home & Kitchen' },
            { label: 'Beauty', value: 'Beauty' },
            { label: 'Sports', value: 'Sports' },
            { label: 'Books', value: 'Books' }
          ]}
          className="w-full mb-4"
        />
        <CustomSelect 
          value={form.status || 'active'} 
          onChange={(val) => setForm({...form, status: val })}
          placeholder="Select Status"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Out of Stock', value: 'out_of_stock' }
          ]}
          className="w-full mb-4"
        />
        <div style={{ display: 'flex', gap: 14, marginTop: 28 }}>
          <button type="button" className="btn" style={{ flex: 1, background: '#f1f5f9', justifyContent: 'center' }} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{product? 'Update' : 'Create'} Product</button>
        </div>
      </form>
    </div></div>
  );
}

//... copy paste your other components here - AuthPage, DashboardPage etc. They are fine

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      const { data, error } = isLogin? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (!isLogin && !data?.session) {
        setSuccess('Account created! Please check your email to verify your account.');
        setTimeout(() => setIsLogin(true), 4000);
      }
    } catch (err) { setError('Failed to fetch. Check Supabase Email auth is enabled.'); }
  };
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
      <div className="card" style={{ width: 460, padding: 48, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 42, fontWeight: 900, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12, letterSpacing: '-1px' }}>NovaBoard</h1>
          <p style={{ color: '#64748b', fontSize: 15, fontWeight: 600 }}>Premium E-Commerce Admin Dashboard</p>
        </div>
        <h2 style={{ marginBottom: 28, textAlign: 'center', fontWeight: 800, fontSize: 28, color: '#0f172a' }}>{isLogin? 'Welcome Back' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16, padding: 14, background: '#fee2e2', borderRadius: 12, fontWeight: 600 }}>{error}</p>}
          {success && <p style={{ color: '#16a34a', fontSize: 14, marginBottom: 16, padding: 14, background: '#dcfce7', borderRadius: 12, fontWeight: 600 }}>{success}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 16, fontSize: 17 }}>{isLogin? 'Sign In' : 'Sign Up'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 15, color: '#64748b', fontWeight: 500 }}>{isLogin? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: '#667eea', cursor: 'pointer', fontWeight: 800 }} onClick={() => setIsLogin(!isLogin)}>{isLogin? 'Sign Up' : 'Sign In'}</span>
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
    revenue: orders.filter(o => new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === date && o.status !== 'Cancelled').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) 
  })); 
  const categoryData = Object.values(products.reduce((acc, p) => { 
    acc[p.category] = acc[p.category] || { name: p.category, value: 0 }; 
    acc[p.category].value += 1; return acc; 
  }, {})); 
  
  return (<>
    <div className="header"><div><h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 10, color: '#0f172a' }}>Dashboard</h1><p style={{ color: '#64748b', fontSize: 16, fontWeight: 500 }}>Welcome back! Here's your business overview</p></div></div>
    <div className="stats-grid">
      <div className="stat-card"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}><div><p style={{ color: '#64748b', fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Total Products</p><h3 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a' }}>{stats.totalProducts}</h3></div><div style={{ padding: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 16 }}><Package size={28} color="white" /></div></div><div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 14, fontWeight: 700 }}><TrendingUp size={18} /> Active inventory</div></div>
      <div className="stat-card"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}><div><p style={{ color: '#64748b', fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Total Orders</p><h3 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a' }}>{stats.totalOrders}</h3></div><div style={{ padding: 16, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: 16 }}><ShoppingCart size={28} color="white" /></div></div><div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 14, fontWeight: 700 }}><TrendingUp size={18} /> All time orders</div></div>
      <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
            <div>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Revenue</p>
              <h3 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a' }}>₹{orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toLocaleString('en-IN')}</h3>
            </div>
            <div style={{ padding: 16, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: 16 }}>
              <TrendingUp size={28} color="white" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 14, fontWeight: 700 }}>
            <TrendingUp size={18} /> All active orders
          </div>
        </div>
      <div className="stat-card"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}><div><p style={{ color: '#64748b', fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Low Stock Alert</p><h3 style={{ fontSize: 40, fontWeight: 900, color: stats.lowStock > 0? '#ef4444' : '#10b981' }}>{stats.lowStock}</h3></div><div style={{ padding: 16, background: stats.lowStock > 0? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 16 }}><AlertTriangle size={28} color="white" /></div></div><div style={{ display: 'flex', alignItems: 'center', gap: 8, color: stats.lowStock > 0? '#ef4444' : '#10b981', fontSize: 14, fontWeight: 700 }}><AlertTriangle size={18} /> {stats.lowStock > 0? 'Needs attention' : 'All stocked'}</div></div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
      <div className="card"><h3 style={{ marginBottom: 24, fontWeight: 800, fontSize: 20, color: '#0f172a' }}>Revenue Trend - Last 7 Days</h3><ResponsiveContainer width="100%" height={320}><BarChart data={chartData}><XAxis dataKey="date" stroke="#94a3b8" style={{ fontWeight: 600 }} /><YAxis stroke="#94a3b8" style={{ fontWeight: 600 }} /><Tooltip contentStyle={{ background: 'white', border: 'none', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 12 }} /><Bar dataKey="revenue" fill="url(#colorGradient)" radius={[10, 10, 0, 0]} /><defs><linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#667eea" stopOpacity={1} /><stop offset="100%" stopColor="#764ba2" stopOpacity={0.8} /></linearGradient></defs></BarChart></ResponsiveContainer></div>
      <div className="card"><h3 style={{ marginBottom: 24, fontWeight: 800, fontSize: 20, color: '#0f172a' }}>Products by Category</h3><ResponsiveContainer width="100%" height={320}><PieChart><Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} fill="#8884d8" dataKey="value" label>{categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
      <div className="card"><h3 style={{ marginBottom: 24, fontWeight: 800, fontSize: 20, color: '#0f172a' }}>Recent Orders</h3><table><thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{orders.slice(0, 5).map(order => (<tr key={order.id}><td style={{ fontWeight: 700 }}>#{order.id ? order.id.toString().slice(0, 8):order.id}</td><td>{order.customer_name}</td><td style={{ fontWeight: 800 }}>
        ₹{order.total_amount || order.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0}
        </td><td><span className={`badge ${order.status === 'Delivered'? 'badge-success' : order.status === 'Shipped'? 'badge-info' : order.status === 'Packed'? 'badge-warning' : 'badge-danger'}`}>{order.status}</span></td><td>{new Date(order.created_at).toLocaleDateString()}</td></tr>))}</tbody></table></div>
      <div className="card"><h3 style={{ marginBottom: 24, fontWeight: 800, fontSize: 20, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={20} /> Low Stock</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <table><thead><tr><th>Product</th><th>Stock</th></tr></thead><tbody>
            {products.filter(p => p.stock_quantity < 5 && p.status === 'active').map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={p.image_url || 'https://via.placeholder.com/30'} alt="" style={{ width: 30, height: 30, borderRadius: 6, objectFit: 'cover' }} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name.length > 20 ? p.name.slice(0,20)+'...' : p.name}</span>
                  </div>
                </td>
                <td><span className="badge badge-danger">{p.stock_quantity} left</span></td>
              </tr>
            ))}
            {products.filter(p => p.stock_quantity < 5 && p.status === 'active').length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center', color: '#10b981', fontWeight: 600, padding: 20 }}>All products are well stocked!</td></tr>}
          </tbody></table>
        </div>
      </div>
    </div>
      </>);
}

function ProductsPage({ products, categories, productView, setProductView, searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter, onAdd, onEdit, onDelete }) { 
  return (<>
    <div className="header"><h1 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a' }}>Products</h1><button className="btn btn-primary" onClick={onAdd}><Plus size={20} /> Add Product</button></div>
    <div className="card"><div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 16, marginBottom: 28 }}>
      <div style={{ position: 'relative' }}><Search size={20} style={{ position: 'absolute', left: 16, top: 16, color: '#94a3b8' }} /><input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: 48, margin: 0 }} /></div>
      <CustomSelect 
        value={categoryFilter} 
        onChange={setCategoryFilter} 
        placeholder="All Categories"
        options={categories.map(c => ({ label: c, value: c }))} 
      />
      <CustomSelect 
        value={statusFilter} 
        onChange={setStatusFilter} 
        placeholder="All Status"
        options={[ {label: 'Active', value: 'active'}, {label: 'Out of Stock', value: 'out_of_stock'} ]} 
      />
      <button className="btn" style={{ background: productView === 'table'? '#e2e8f0' : 'transparent', margin: 0, padding: '14px' }} onClick={() => setProductView('table')}><List size={20} /></button>
      <button className="btn" style={{ background: productView === 'grid'? '#e2e8f0' : 'transparent', margin: 0, padding: '14px' }} onClick={() => setProductView('grid')}><Grid size={20} /></button>
    </div>
    {productView === 'table'? (<table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>{products.map(product => (<tr key={product.id}><td style={{ display: 'flex', alignItems: 'center', gap: 14 }}><img src={product.image_url || 'https://via.placeholder.com/60'} alt="" style={{ width: 60, height: 60, borderRadius: 14, objectFit: 'cover' }} /><div><p style={{ fontWeight: 800, fontSize: 15 }}>{product.name}</p><p style={{ fontSize: 13, color: '#64748b' }}>{product.description?.slice(0, 40)}...</p></div></td>
        <td style={{ fontWeight: 600 }}>{product.category}</td><td style={{ fontWeight: 800, fontSize: 16 }}>₹{product.price}</td>
        <td><span className={`badge ${product.stock_quantity < 5? 'badge-danger' : product.stock_quantity < 20? 'badge-warning' : 'badge-success'}`}>{product.stock_quantity} units</span></td>
        <td><span className={`badge ${product.status === 'active'? 'badge-success' : 'badge-danger'}`}>{product.status}</span></td>
        <td><button className="btn" style={{ padding: 10, marginRight: 10 }} onClick={() => onEdit(product)}><Edit size={18} /></button><button className="btn btn-danger" style={{ padding: 10 }} onClick={() => onDelete(product.id)}><Trash2 size={18} /></button></td>
      </tr>))}</tbody></table>) : (<div className="grid">{products.map(product => (<div key={product.id} className="product-card">
        <img src={product.image_url || 'https://via.placeholder.com/400x300'} alt="" style={{ width: '100%', height: 220, objectFit: 'cover' }} />
        <div style={{ padding: 24 }}><h4 style={{ fontWeight: 800, marginBottom: 10, fontSize: 19, color: '#0f172a' }}>{product.name}</h4><p style={{ color: '#64748b', fontSize: 14, marginBottom: 16, height: 44, overflow: 'hidden' }}>{product.description}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><span style={{ fontSize: 28, fontWeight: 900, color: '#667eea' }}>₹{product.price}</span><span className={`badge ${product.status === 'active'? 'badge-success' : 'badge-danger'}`}>{product.status}</span></div>
          <div style={{ display: 'flex', gap: 10 }}><button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onEdit(product)}><Edit size={18} /> Edit</button><button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onDelete(product.id)}><Trash2 size={18} /> Delete</button></div>
        </div></div>))}</div>)}</div>
  </>);
}

function OrdersPage({ orders, customers, updateStatus, downloadInvoice, onAdd }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateStatus(orderId, newStatus);
      setToastMsg(`Status updated to ${newStatus}`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error("Status Update Error:", err);
      alert("Failed to update status: " + (err.message || err));
    } finally {
      setUpdatingId(null);
    }
  };

  const getColors = (s) => {
    switch(s) {
      case 'Pending': return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'Shipped': return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };
      case 'Delivered': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'Cancelled': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
      default: return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
    }
  };

  return (<>
    {toastMsg && <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '8px', zIndex: 1000, fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>{toastMsg}</div>}
    <div className="header"><h1 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a' }}>Orders</h1><button className="btn btn-primary" onClick={onAdd}><Plus size={20} /> Create Order</button></div>
    <div className="card"><table><thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>{orders.map(order => {
        const colors = getColors(order.status || 'Pending');
        return (
        <tr key={order.id}><td style={{ fontWeight: 700 }}>#{order.id ? order.id.toString().slice(0, 8) : 'N/A'}</td>
          <td><div><p style={{ fontWeight: 700 }}>{order.customer_name}</p><p style={{ fontSize: 12, color: '#64748b' }}>{order.customer_email}</p></div></td>
          <td style={{ fontWeight: 800 }}>₹{order.total_amount}</td>
          <td>
            <CustomSelect 
              value={order.status || 'Pending'} 
              onChange={(val) => handleStatusChange(order.id, val)} 
              disabled={updatingId === order.id}
              style={{ 
                padding: '8px 12px', 
                borderRadius: '8px', 
                border: `2px solid ${colors.border}`, 
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: '13px', 
                fontWeight: '800', 
                margin: 0
              }}
              options={[
                { label: 'Pending', value: 'Pending' },
                { label: 'Shipped', value: 'Shipped' },
                { label: 'Delivered', value: 'Delivered' },
                { label: 'Cancelled', value: 'Cancelled' }
              ]}
              className="min-w-[130px]"
            />
          </td>
          <td>{new Date(order.created_at).toLocaleDateString()}</td>
          <td><button className="btn btn-primary" onClick={() => downloadInvoice(order)}><Download size={18} /> Invoice</button></td>
        </tr>)})}
      </tbody></table></div>
  </>);
}

function CustomersPage({ customers, orders, onAdd, onView }) {
  // Deduplicate customers by email
  const uniqueCustomers = [...new Map((customers || []).map(c => [c.email, c])).values()];

  return (<><div className="header"><h1 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a' }}>Customers</h1><button className="btn btn-primary" onClick={onAdd}><Plus size={20} /> Add Customer</button></div>
    <div className="grid">{uniqueCustomers.map(customer => {
      // Match orders by user_id, or by phone number if user_id is not present
      const customerPhone = customer.mobile_number || customer.phone;
      const customerOrders = orders.filter(o => {
        if (o.user_id && o.user_id === customer.id) return true;
        if (customerPhone && (o.customer_phone === customerPhone || o.phone === customerPhone)) return true;
        return false;
      });
      // Sum all total_amount for this customer
      const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      
      return (<div key={customer.id} className="card" style={{ cursor: 'pointer' }} onClick={() => onView(customer)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 900 }}>
            {customer.username ? customer.username.charAt(0).toUpperCase() : (customer.name ? customer.name.charAt(0).toUpperCase() : 'C')}
          </div>
          <div><h4 style={{ fontWeight: 800, fontSize: 19 }}>{customer.username || customer.name}</h4><p style={{ color: '#64748b', fontSize: 14, marginBottom: 4 }}>{customer.email}</p><p style={{ color: '#64748b', fontSize: 14 }}>{customer.mobile_number || customer.phone || 'No phone'}</p></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 20, borderTop: '2px solid #f1f5f9' }}>
          <div><p style={{ color: '#64748b', fontSize: 12, marginBottom: 6, fontWeight: 700 }}>Total Orders</p><p style={{ fontSize: 28, fontWeight: 800 }}>{customerOrders.length}</p></div>
          <div><p style={{ color: '#64748b', fontSize: 12, marginBottom: 6, fontWeight: 700 }}>Total Spent</p><p style={{ fontSize: 28, fontWeight: 800, color: '#667eea' }}>₹{totalSpent.toFixed(2)}</p></div>
        </div>
      </div>);
    })}</div>
  </>);
}

function CustomerModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const handleSubmit = (e) => { e.preventDefault(); onSave(form); };
  return (
    <div className="modal" onClick={onClose}><div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2 style={{ marginBottom: 28, fontWeight: 800, fontSize: 26 }}>Add New Customer</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value })} required />
        <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({...form, email: e.target.value })} required />
        <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value })} />
        <textarea placeholder="Address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value })} rows={3} />
        <div style={{ display: 'flex', gap: 14, marginTop: 28 }}>
          <button type="button" className="btn" style={{ flex: 1, background: '#f1f5f9', justifyContent: 'center' }} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Customer</button>
        </div>
      </form>
    </div></div>
  );
}

function OrderModal({ customers, products, onSave, onClose }) {
  const [form, setForm] = useState({ customer_id: '', product_id: '', quantity: 1 });
  const selectedProduct = products.find(p => p.id === form.product_id);
  const total = selectedProduct? (selectedProduct.price * form.quantity).toFixed(2) : 0;
  const handleSubmit = (e) => {
    e.preventDefault(); 
    const customer = customers.find(c => c.id === form.customer_id);
    onSave({ 
      customer_id: form.customer_id, 
      customer_name: customer.name, 
      customer_email: customer.email, 
      items: [{ // <-- IDHI KOTHA ADD CHEYI
        id: form.product_id, 
        name: selectedProduct.name, 
        price: selectedProduct.price, 
        qty: form.quantity 
      }], 
      total_amount: parseFloat(total), 
      status: 'Pending' 
    });
  };
  return (
    <div className="modal" onClick={onClose}><div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2 style={{ marginBottom: 28, fontWeight: 800, fontSize: 26 }}>Create New Order</h2>
      <form onSubmit={handleSubmit}>
        <select value={form.customer_id} onChange={(e) => setForm({...form, customer_id: e.target.value })} required>
          <option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.email}</option>)}
        </select>
        <select value={form.product_id} onChange={(e) => setForm({...form, product_id: e.target.value })} required>
          <option value="">Select Product</option>{products.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price} (Stock: {p.stock_quantity})</option>)}
        </select>
        <input type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({...form, quantity: parseInt(e.target.value) || 1 })} required />
        {selectedProduct && (<div style={{ padding: 20, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: 700 }}>Order Summary</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontWeight: 600 }}>Product:</span><span>{selectedProduct.name}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontWeight: 600 }}>Price:</span><span>₹{selectedProduct.price}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ fontWeight: 600 }}>Quantity:</span><span>{form.quantity}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '2px solid #e2e8f0' }}><span style={{ fontWeight: 800, fontSize: 18 }}>Total:</span><span style={{ fontWeight: 900, fontSize: 24, color: '#667eea' }}>₹{total}</span></div>
        </div>)}
        <div style={{ display: 'flex', gap: 14, marginTop: 28 }}>
          <button type="button" className="btn" style={{ flex: 1, background: '#f1f5f9', justifyContent: 'center' }} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={!form.customer_id ||!form.product_id}>Create Order</button>
        </div>
      </form>
    </div></div>
  );
}

function CustomerDetailModal({ customer, orders, onClose }) {
  const totalSpent = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
  return (
    <div className="modal" onClick={onClose}><div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2 style={{ marginBottom: 24, fontWeight: 800, fontSize: 24 }}>Customer Details</h2>
      <div style={{ marginBottom: 24 }}>
        <div style={{ padding: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 16, color: 'white', marginBottom: 20 }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{customer.name}</h3>
          <p style={{ opacity: 0.9 }}>{customer.email}</p>
          <p style={{ opacity: 0.9 }}>{customer.phone || 'No phone'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ padding: 16, background: '#f1f5f9', borderRadius: 12 }}>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Total Orders</p>
            <p style={{ fontSize: 28, fontWeight: 800 }}>{orders.length}</p>
          </div>
          <div style={{ padding: 16, background: '#f1f5f9', borderRadius: 12 }}>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>Total Spent</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#667eea' }}>₹{totalSpent.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Order History</h3>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {orders.length === 0? <p style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>No orders yet</p> :
          orders.map(order => (
              <div key={order.id} style={{ padding: 16, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700 }}>#{order.id ? order.id.toString().slice(0, 8) : 'N/A'}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, fontSize: 18 }}>₹{order.total_amount || order.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0}</p>
                </div>
              </div>
            ))
        }
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} onClick={onClose}>Close</button>
    </div></div>
  );
}

function ProfileDetailModal({ user, onClose }) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '900',
            fontSize: '32px',
            margin: '0 auto 16px',
            boxShadow: '0 8px 16px rgba(102,126,234,0.3)'
          }}>
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '24px', color: '#0f172a', marginBottom: '4px' }}>{user.username}</h2>
          <span className="badge badge-info" style={{ textTransform: 'capitalize', fontSize: '13px', padding: '4px 12px' }}>
            {user.role} Account
          </span>
        </div>
        
        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', marginBottom: '24px' }}>
          <div style={{ marginBottom: '14px' }}>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Username
            </span>
            <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>{user.username}</span>
          </div>
          
          <div style={{ marginBottom: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Email Address
            </span>
            <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>{user.email}</span>
          </div>
          
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Mobile Number
            </span>
            <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>{user.mobile_number}</span>
          </div>
        </div>
        
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
          Close Profile
        </button>
      </div>
    </div>
  );
}