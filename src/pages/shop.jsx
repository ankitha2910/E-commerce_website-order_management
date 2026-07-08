import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogOut, Heart, ShoppingCart, ShoppingBag, LayoutDashboard, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { useCart } from '../context/CartContext';

export default function Shop() {
  const { cart, addToCart, updateQty, removeFromCart, cartTotal } = useCart();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [activeCategory, setActiveCategory] = useState('For You');
  const [sortBy, setSortBy] = useState('new');
  const [priceRange, setPriceRange] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const navigate = useNavigate();

  const categoryData = [
    { name: 'For You', icon: 'https://img.icons8.com/color/96/star--v1.png' },
    { name: 'Electronics', icon: 'https://img.icons8.com/color/96/laptop.png' },
    { name: 'Fashion', icon: 'https://img.icons8.com/color/96/t-shirt.png' },
    { name: 'Home & Kitchen', icon: 'https://img.icons8.com/color/96/home.png' },
    { name: 'Beauty', icon: 'https://img.icons8.com/color/96/lipstick.png' }
  ];

  useEffect(() => {
    fetchProducts();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const fetchProducts = async () => {
    const { data: productsData, error: productsError } = await supabase.from('products').select('*').order('id', { ascending: false });
    const { data: reviewsData } = await supabase.from('reviews').select('product_id, rating');
    
    if (productsData && reviewsData) {
      const merged = productsData.map(p => ({
        ...p,
        reviews: reviewsData.filter(r => r.product_id === p.id)
      }));
      setProducts(merged);
    } else {
      setProducts(productsData || []);
      if (productsError) console.error("Error fetching products:", productsError);
    }
  };

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
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
        role: profile?.role || user.user_metadata?.role || 'customer',
        address: profile?.address || ''
      });

      // Merge wishlist: if DB is empty but local storage has items, preserve local storage and sync to DB
      const dbWishlist = profile?.wishlist || [];
      if (dbWishlist.length === 0 && wishlist.length > 0) {
        // Local storage has items, DB is empty -> sync UP to DB
        supabase.from('profiles').update({ wishlist }).eq('id', user.id).then();
      } else {
        // DB has items (or both are empty) -> sync DOWN to local state
        setWishlist(dbWishlist);
      }

      const { data: userOrders } = await supabase.from('orders').select('*').eq('user_id', user.id).order('id', { ascending: false });
      setMyOrders(userOrders || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setWishlist([]); // Clear state
    localStorage.removeItem('wishlist'); // Clear local storage
    setCurrentUser(null);
    navigate('/');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showToast(`${product.name} added to cart!`);
  };

  const buyNow = () => {
    if (cart.length === 0) return showToast('Cart is empty!');
    const orderItems = cart.map(item => ({ id: item.id, name: item.name, price: item.price, qty: item.qty, image_url: item.image_url }));
    navigate('/checkout', { state: { cart: orderItems } });
  };

  const toggleWishlist = (product) => {
    let newWishlist;
    if (wishlist.find(item => item.id === product.id)) {
      newWishlist = wishlist.filter(item => item.id !== product.id);
      showToast('Removed from wishlist');
    } else {
      newWishlist = [...wishlist, product];
      showToast('Added to wishlist!');
    }
    setWishlist(newWishlist);
    
    // Explicitly sync to database only when user takes an action
    if (currentUser?.id) {
      supabase.from('profiles').update({ wishlist: newWishlist }).eq('id', currentUser.id).then(({ error }) => {
        if (error) console.error('Failed to update wishlist in DB:', error);
      });
    }
  };

  let filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'For You' || p.category === activeCategory;
    
    let matchPrice = true;
    if (priceRange === 'under1000') matchPrice = p.price < 1000;
    if (priceRange === '1000to5000') matchPrice = p.price >= 1000 && p.price <= 5000;
    if (priceRange === 'over5000') matchPrice = p.price > 5000;
    
    return matchSearch && matchCategory && matchPrice;
  });

  if (sortBy === 'low') filteredProducts.sort((a, b) => a.price - b.price);
  if (sortBy === 'high') filteredProducts.sort((a, b) => b.price - a.price);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F3F6', fontFamily: "'Roboto', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .sidebar {
          width: 260px;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 24px;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          top: 0;
          left: 0;
          z-index: 200;
          font-family: 'Inter', sans-serif;
        }
        .logo {
          font-size: 28px;
          font-weight: 900;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nav-item {
          padding: 14px 18px;
          margin: 6px 0;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s;
          font-weight: 600;
          color: #94a3b8;
        }
        .nav-item:hover {
          color: white;
          background: rgba(255,255,255,0.08);
          transform: translateX(4px);
        }
        .nav-item.active {
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 4px 16px rgba(102,126,234,0.4);
        }
        .main-content {
          flex: 1;
          margin-left: 260px;
          padding-bottom: 80px;
          background: #F1F3F6;
          min-height: 100vh;
          width: calc(100% - 260px);
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15,23,42,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
        }
        .modal-content {
          background: white;
          border-radius: 24px;
          padding: 36px;
          width: 90%;
          max-width: 440px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
        }
        .badge-info {
          background: #dbeafe;
          color: #1e40af;
        }
        .btn {
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
          font-size: 14px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102,126,234,0.3);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102,126,234,0.5);
        }
      `}</style>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo" style={{ cursor: 'pointer', fontStyle: 'italic' }} onClick={() => navigate('/shop')}>NovaBoard</div>
        <div className="nav-item active" onClick={() => navigate('/shop')}><ShoppingBag size={20} /> Shop</div>
        <div className="nav-item" onClick={() => setShowWishlist(true)}><Heart size={20} /> Wishlist ({wishlist.length})</div>
        <div className="nav-item" onClick={() => setShowCart(true)}><ShoppingCart size={20} /> Cart ({cart.reduce((a, b) => a + b.qty, 0)})</div>
        
        {currentUser && (
          <div className="nav-item" onClick={() => navigate('/account/orders')}><ShoppingBag size={20} /> My Orders</div>
        )}
        
        {currentUser?.role === 'admin' && (
          <div className="nav-item" onClick={() => navigate('/admin')}><LayoutDashboard size={20} /> Admin Panel</div>
        )}
        
        <div style={{ flex: 1 }}></div>

        {/* Profile Sidebar Section */}
        {currentUser && (
          <div 
            className="nav-item" 
            onClick={() => navigate('/account')}
            style={{ 
              marginTop: 'auto', 
              borderTop: '1px solid rgba(255,255,255,0.1)', 
              paddingTop: '20px', 
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
              {currentUser.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'white' }}>
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

      {/* MAIN CONTENT */}
      <div className="main-content">
        {toast && <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: '#2874f0', color: 'white', padding: '12px 24px', borderRadius: '8px', zIndex: 1000, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>{toast}</div>}

        {/* HEADER */}
        <div style={{ background: 'white', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search for products, brands and more..." 
              style={{
                width: '100%', 
                padding: '14px 20px 14px 48px', 
                borderRadius: '12px', 
                border: '2px solid #e2e8f0', 
                outline: 'none', 
                fontSize: '15px',
                fontFamily: "'Inter', sans-serif",
                background: '#f8fafc',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.background = 'white'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
            />
            <svg style={{ position: 'absolute', left: '16px', top: '16px', color: '#94a3b8' }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="categories-bar" style={{ background: 'white', padding: '16px 40px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
          {categoryData.map(cat => (
            <div key={cat.name} onClick={() => setActiveCategory(cat.name)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: '90px', padding: '8px', borderBottom: activeCategory === cat.name ? '3px solid #2874f0' : '3px solid transparent' }}>
              <img src={cat.icon} style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '6px' }} alt="" />
              <span style={{ fontSize: '14px', fontWeight: '600', color: activeCategory === cat.name ? '#2874f0' : '#212121' }}>{cat.name}</span>
            </div>
          ))}
        </div>

        {/* BANNER SLIDER */}
        <div style={{ background: 'white', margin: '16px 20px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600" 
            style={{
              width: '100%', 
              height: '250px',  
              objectFit: 'cover'
            }} 
            alt="Promotion Banner"
          />
        </div>

        {/* SORT + PRODUCTS AND FILTERS */}
        <div style={{ padding: '10px 20px', maxWidth: '1400px', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', background: 'white', padding: '16px 24px', borderRadius: '4px', borderBottom: '1px solid #f0f0f0', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
               <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#212121' }}>{activeCategory === 'For You' ? 'All Products' : activeCategory} <span style={{fontSize: '12px', color: '#878787', fontWeight: 'normal'}}>({filteredProducts.length} items)</span></h2>
               <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <span style={{ fontSize: '14px', fontWeight: 500 }}>Price</span>
                   <select value={priceRange} onChange={e => setPriceRange(e.target.value)} style={{ border: 'none', outline: 'none', borderBottom: '2px solid #2874f0', fontSize: '14px', paddingBottom: '4px', cursor: 'pointer', fontWeight: '500' }}>
                     <option value="all">Any Price</option>
                     <option value="under1000">Under ₹1,000</option>
                     <option value="1000to5000">₹1,000 - ₹5,000</option>
                     <option value="over5000">Over ₹5,000</option>
                   </select>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <span style={{ fontSize: '14px', fontWeight: 500 }}>Sort By</span>
                   <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ border: 'none', outline: 'none', borderBottom: '2px solid #2874f0', fontSize: '14px', paddingBottom: '4px', cursor: 'pointer', fontWeight: '500' }}>
                     <option value="new">Relevance</option>
                     <option value="low">Price -- Low to High</option>
                     <option value="high">Price -- High to Low</option>
                   </select>
                 </div>
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
              {filteredProducts.map(product => {
                const discount = product.mrp > 0 ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
                
                const productReviews = product.reviews || [];
                const avgRating = productReviews.length > 0 
                  ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
                  : 4.0;
                const reviewCount = productReviews.length;

                return (
                  <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} style={{ background: 'white', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} 
                      style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', border: '1px solid #f0f0f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, color: wishlist.find(item => item.id === product.id) ? '#ff4d4f' : '#c2c2c2', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                      title={wishlist.find(item => item.id === product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart size={16} fill={wishlist.find(item => item.id === product.id) ? '#ff4d4f' : 'none'} />
                    </button>
                    <div style={{ height: '200px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                      <img src={product.image_url} alt={product.name} style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                    </div>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#212121', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</h3>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginBottom: '8px' }}>
                        <span style={{ background: avgRating >= 3 ? '#388E3C' : (avgRating >= 2 ? '#ff9f00' : '#ff6161'), color: 'white', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>{avgRating} ★</span>
                        <span style={{ color: '#878787', fontWeight: 500 }}>({reviewCount})</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                        <p style={{ fontSize: '18px', fontWeight: '500', color: '#212121' }}>₹{product.price.toLocaleString('en-IN')}</p>
                        {product.mrp > product.price && (
                          <>
                            <p style={{ fontSize: '12px', color: '#878787', textDecoration: 'line-through' }}>₹{product.mrp.toLocaleString('en-IN')}</p>
                            <p style={{ fontSize: '12px', color: '#388E3C', fontWeight: '500' }}>{discount}% off</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      {/* CART POPUP */}
      {showCart && (
        <div onClick={() => setShowCart(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'flex-end', zIndex: 999, backdropFilter: 'blur(4px)' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '420px', background: 'white', padding: '30px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>🛒 Your Cart</h2>
                {/* CART ITEMS */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '60px' }}>
                      <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                      <p>Your cart is empty.</p>
                    </div>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                        <img src={item.image_url} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain', background: 'white', borderRadius: '8px', padding: '4px' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#1e293b' }}>{item.name}</h4>
                          <p style={{ fontWeight: 800, color: '#667eea', fontSize: '16px' }}>₹{item.price}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <button onClick={() => updateQty(item.id, -1)} style={{ width: '28px', height: '28px', border: 'none', background: '#f1f5f9', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#475569' }}>-</button>
                          <span style={{ fontWeight: '700', fontSize: '14px', width: '20px', textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} style={{ width: '28px', height: '28px', border: 'none', background: '#667eea', color: 'white', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>✕</button>
                      </div>
                    ))
                  )}
                </div>
                {/* CART FOOTER */}
                {cart.length > 0 && (
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px dashed #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px' }}>
                      <span style={{ fontWeight: 700, color: '#64748b' }}>Total Amount:</span>
                      <span style={{ fontWeight: 900, color: '#0f172a' }}>₹{cartTotal}</span>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} onClick={buyNow}>
                      Proceed to Checkout
                    </button>
                  </div>
                )}
            <button onClick={() => setShowCart(false)} style={{ width: '100%', padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', marginTop: '10px', fontWeight: '600', cursor: 'pointer' }}>Close Cart</button>
          </div>
        </div>
      )}

      {/* WISHLIST POPUP */}
      {showWishlist && (
        <div onClick={() => setShowWishlist(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'flex-end', zIndex: 999, backdropFilter: 'blur(4px)' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '420px', background: 'white', padding: '30px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '24px' }}>❤️ Your Wishlist</h2>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {wishlist.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px', fontWeight: 500 }}>Your wishlist is empty</p> : 
                wishlist.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '14px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <img src={item.image_url} style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '4px' }} alt="" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{item.name}</p>
                      <p style={{ fontWeight: '800', color: '#667eea', marginTop: '4px' }}>₹{item.price}</p>
                      <button onClick={() => { handleAddToCart(item); toggleWishlist(item); }} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', marginTop: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Move to Cart</button>
                    </div>
                  </div>
                ))
              }
            </div>
            <button onClick={() => setShowWishlist(false)} style={{ width: '100%', padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', marginTop: '10px', fontWeight: '600', cursor: 'pointer' }}>Close Wishlist</button>
          </div>
        </div>
      )}
    </div>
  );
}