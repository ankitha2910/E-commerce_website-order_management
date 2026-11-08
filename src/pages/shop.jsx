import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogOut, Heart, ShoppingCart, ShoppingBag, LayoutDashboard, Search, X, Plus, Minus, Star, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Shop() {
  const { cart, addToCart, updateQty, removeFromCart, cartTotal } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [activeCategory, setActiveCategory] = useState('For You');
  const [sortBy, setSortBy] = useState('new');
  const [priceRange, setPriceRange] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setWishlist([]);
        setCurrentUser(null);
      } else if (event === 'SIGNED_IN') {
        fetchUserProfile();
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

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
        username: profile?.username || profile?.name || user.user_metadata?.username || user.email.split('@')[0],
        role: profile?.role || user.user_metadata?.role || 'customer',
      });
      fetchWishlist(user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setWishlist([]);
    setCurrentUser(null);
    navigate('/');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleAddToCart = (product, e) => {
    if(e) e.stopPropagation();
    addToCart(product);
    showToast(`${product.name} added to cart!`);
  };

  const buyNow = () => {
    if (cart.length === 0) return showToast('Cart is empty!');
    const orderItems = cart.map(item => ({ id: item.id, name: item.name, price: item.price, qty: item.qty, image_url: item.image_url }));
    navigate('/checkout', { state: { cart: orderItems } });
  };

  const fetchWishlist = async (uid) => {
    if (!uid) {
      setWishlist([]);
      return;
    }
    const { data } = await supabase
      .from('wishlist_items')
      .select(`id, products (*)`)
      .eq('user_id', uid);
      
    if (data) {
      const formattedWishlist = data
        .filter(item => item.products)
        .map(item => ({
          ...item.products,
          wishlist_item_id: item.id
        }));
      setWishlist(formattedWishlist);
    }
  };

  const toggleWishlist = async (product, e) => {
    if(e) e.stopPropagation();
    if (!currentUser) {
      alert("Please login to add to wishlist");
      return;
    }

    const isWishlisted = wishlist.find(item => item.id === product.id);

    if (isWishlisted) {
      await supabase.from('wishlist_items').delete().eq('user_id', currentUser.id).eq('product_id', product.id);
      showToast('Removed from wishlist');
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      const { data, error } = await supabase.from('wishlist_items').insert([{ user_id: currentUser.id, product_id: product.id }]).select().single();
      if (!error && data) {
        showToast('Added to wishlist!');
        setWishlist([...wishlist, { ...product, wishlist_item_id: data.id }]);
      }
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
    <div className="min-h-screen flex flex-col md:flex-row relative" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* MOBILE STICKY HEADER */}
      <header className="md:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--glass-border)' }}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            aria-label="Open Navigation"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/shop')}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-sm" style={{ background: 'var(--gradient-brand)' }}>N</div>
            <span className="text-lg font-bold premium-text-gradient">NovaBoard</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowWishlist(true)} 
            className="relative p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            aria-label="Wishlist"
          >
            <Heart size={18} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setShowCart(true)} 
            className="relative p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            {cart.reduce((a, b) => a + b.qty, 0) > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MOBILE BACKDROP */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (Desktop: fixed, Mobile: off-canvas drawer) */}
      <div 
        className={`fixed top-0 bottom-0 left-0 w-72 md:w-64 h-full flex flex-col p-6 z-50 md:z-40 border-r transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`} 
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--glass-border)' }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { navigate('/shop'); setMobileMenuOpen(false); }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white" style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}>N</div>
            <span className="text-xl font-bold premium-text-gradient">NovaBoard</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <button onClick={() => { navigate('/shop'); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all" style={{ background: 'var(--glass-bg)', border: '1px solid var(--primary-accent)', color: 'var(--primary-accent)' }}>
            <ShoppingBag size={20} /> Shop
          </button>
          <button onClick={() => { setShowWishlist(true); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
            <Heart size={20} /> Wishlist <span className="ml-auto px-2 py-0.5 rounded-full text-xs text-white" style={{ background: 'var(--glass-bg)' }}>{wishlist.length}</span>
          </button>
          <button onClick={() => { setShowCart(true); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
            <ShoppingCart size={20} /> Cart <span className="ml-auto px-2 py-0.5 rounded-full text-xs text-white" style={{ background: 'var(--glass-bg)' }}>{cart.reduce((a, b) => a + b.qty, 0)}</span>
          </button>
          {currentUser && (
            <button onClick={() => { navigate('/account/orders'); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
              <ShoppingBag size={20} /> My Orders
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mt-4 text-emerald-400 hover:bg-emerald-400/10">
              <LayoutDashboard size={20} /> Admin Panel
            </button>
          )}
        </nav>

        {currentUser && (
          <div className="mt-auto pt-4 flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all hover:bg-white/5 border-t" style={{ borderColor: 'var(--glass-border)' }} onClick={() => { navigate('/account'); setMobileMenuOpen(false); }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}>
              {currentUser.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-semibold text-sm truncate text-white">{currentUser.username}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>View Profile</div>
            </div>
          </div>
        )}
        <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-medium">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-64 min-h-screen relative pb-20 w-full min-w-0">
        {toast && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full font-semibold z-50 animate-fade-in-up flex items-center gap-2 text-white" style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow-strong)' }}>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            {toast}
          </div>
        )}

        {/* TOP SEARCH HEADER */}
        <header className="sticky top-0 z-20 premium-glass-nav px-4 md:px-8 py-3 md:py-5 flex justify-center items-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search premium products..." 
              className="premium-input pl-11 text-sm md:text-base py-2.5 md:py-3.5"
            />
          </div>
        </header>

        {/* CATEGORIES */}
        <div className="px-4 md:px-8 py-4 md:py-6 border-b" style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-surface)' }}>
          <div className="flex justify-start sm:justify-center gap-4 sm:gap-8 md:gap-16 overflow-x-auto no-scrollbar">
            {categoryData.map(cat => (
              <div key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`flex flex-col items-center flex-shrink-0 cursor-pointer transition-all group ${activeCategory === cat.name ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-2 sm:mb-3 flex items-center justify-center transition-all ${activeCategory === cat.name ? 'bg-indigo-500/20 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/5 border border-white/5 group-hover:bg-white/10'}`}>
                  <img src={cat.icon} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" alt={cat.name} />
                </div>
                <span className="text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap" style={{ color: activeCategory === cat.name ? 'var(--primary-accent)' : 'var(--text-muted)' }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PRODUCTS SECTION */}
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
             <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
               {activeCategory === 'For You' ? 'Featured Collection' : activeCategory} 
               <span className="text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)' }}>{filteredProducts.length}</span>
             </h2>
             <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
               <div className="flex items-center gap-2">
                 <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Price</span>
                 <select value={priceRange} onChange={e => setPriceRange(e.target.value)} className="bg-transparent text-xs sm:text-sm font-semibold text-white border-none outline-none cursor-pointer focus:ring-0 [&>option]:bg-[#121217]">
                   <option value="all">All Prices</option>
                   <option value="under1000">Under ₹1,000</option>
                   <option value="1000to5000">₹1,000 - ₹5,000</option>
                   <option value="over5000">Over ₹5,000</option>
                 </select>
               </div>
               <div className="w-px h-5 sm:h-6" style={{ background: 'var(--glass-border)' }}></div>
               <div className="flex items-center gap-2">
                 <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Sort</span>
                 <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent text-xs sm:text-sm font-semibold text-white border-none outline-none cursor-pointer focus:ring-0 [&>option]:bg-[#121217]">
                   <option value="new">Relevance</option>
                   <option value="low">Lowest Price</option>
                   <option value="high">Highest Price</option>
                 </select>
               </div>
             </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 animate-fade-in-up">
            {filteredProducts.map(product => {
              const isWishlisted = wishlist.some(item => item.id === product.id);
              const discount = product.mrp > 0 ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
              const productReviews = product.reviews || [];
              const avgRating = productReviews.length > 0 ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1) : 4.0;

              return (
                <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="premium-card cursor-pointer flex flex-col relative h-full group">
                  
                  {/* Floating Actions */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => toggleWishlist(product, e)} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all ${isWishlisted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-black/50 text-white hover:bg-black/70'}`}>
                      <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Image Container */}
                  <div className="h-40 sm:h-56 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden transition-colors" style={{ background: 'var(--glass-bg)' }}>
                    <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    {discount > 0 && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 premium-badge bg-indigo-500/20 text-indigo-300 border-indigo-500/30 backdrop-blur-md text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1">
                        {discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-bold text-yellow-400" style={{ background: 'rgba(250, 204, 21, 0.1)' }}>
                        <Star size={11} fill="currentColor" /> {avgRating}
                      </div>
                      <span className="text-[11px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>({productReviews.length})</span>
                    </div>
                    
                    <h3 className="font-semibold text-xs sm:text-base mb-2 sm:mb-4 line-clamp-2 leading-tight sm:leading-snug flex-1 group-hover:text-indigo-400 transition-colors">{product.name}</h3>
                    
                    <div className="flex items-end justify-between mt-auto pt-2.5 sm:pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                      <div>
                        <div className="text-sm sm:text-xl font-black text-white">₹{product.price.toLocaleString('en-IN')}</div>
                        {product.mrp > product.price && (
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs mt-0.5">
                            <span className="line-through" style={{ color: 'var(--text-muted)' }}>₹{product.mrp.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                      <button onClick={(e) => handleAddToCart(product, e)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-110 flex-shrink-0" style={{ background: 'var(--gradient-brand)' }}>
                        <ShoppingCart size={15} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CART SLIDEOUT OVERLAY */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
          <div className="w-full max-w-md h-full flex flex-col shadow-2xl animate-fade-in-right border-l" style={{ background: 'var(--bg-surface)', borderColor: 'var(--glass-border)' }}>
            <div className="p-6 flex justify-between items-center border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><ShoppingCart size={20}/></div>
                Your Cart
              </h2>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" style={{ background: 'var(--glass-bg)' }}><X size={18}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <ShoppingCart size={48} className="mb-4 opacity-20" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl border" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                    <img src={item.image_url} alt={item.name} className="w-20 h-20 object-contain rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-sm line-clamp-2 text-gray-200">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-400 transition-colors"><X size={16}/></button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="font-bold text-indigo-400">₹{item.price}</p>
                        <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/5">
                          <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded flex items-center justify-center bg-white/10 hover:bg-white/20"><Minus size={14}/></button>
                          <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded flex items-center justify-center bg-white/10 hover:bg-white/20"><Plus size={14}/></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)' }}>
                <div className="flex justify-between text-lg mb-6">
                  <span className="text-gray-400">Total</span>
                  <span className="font-black text-xl text-white">₹{cartTotal}</span>
                </div>
                <button onClick={buyNow} className="premium-btn premium-btn-primary w-full py-4 text-lg">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WISHLIST SLIDEOUT OVERLAY */}
      {showWishlist && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
          <div className="w-full max-w-md h-full flex flex-col shadow-2xl animate-fade-in-right border-l" style={{ background: 'var(--bg-surface)', borderColor: 'var(--glass-border)' }}>
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--glass-border)' }}>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400"><Heart size={20}/></div>
                Wishlist
              </h2>
              <button onClick={() => setShowWishlist(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" style={{ background: 'var(--glass-bg)' }}><X size={18}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <Heart size={48} className="mb-4 opacity-20" />
                  <p>Your wishlist is empty.</p>
                </div>
              ) : (
                wishlist.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl border" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
                    <img src={item.image_url} alt={item.name} className="w-20 h-20 object-contain rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-sm line-clamp-2 text-gray-200">{item.name}</h4>
                        <button onClick={(e) => toggleWishlist(item, e)} className="text-gray-500 hover:text-red-400 transition-colors"><X size={16}/></button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="font-bold text-indigo-400">₹{item.price}</p>
                        <button onClick={(e) => { handleAddToCart(item, e); toggleWishlist(item, e); }} className="premium-btn premium-btn-secondary px-4 py-1.5 text-sm">
                          Move to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animation CSS */}
      <style>{`
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right {
          animation: fadeInRight 0.3s ease-out forwards;
        }
        /* Hide scrollbar */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}