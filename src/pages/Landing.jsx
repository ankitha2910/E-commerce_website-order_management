import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { ShoppingCart, ArrowRight, Star } from 'lucide-react';

export default function Landing() {
  const [products, setProducts] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProducts = async () => {
    const { data: productsData } = await supabase.from('products').select('*').order('id', { ascending: false });
    const { data: reviewsData } = await supabase.from('reviews').select('product_id, rating');
    
    if (productsData && reviewsData) {
      const merged = productsData.map(p => ({
        ...p,
        reviews: reviewsData.filter(r => r.product_id === p.id)
      }));
      setProducts(merged);
    } else {
      setProducts(productsData || []);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'premium-glass-nav py-4' : 'bg-transparent py-6'}`}>
        <div className="premium-container flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl" style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}>
              N
            </div>
            <span className="text-2xl font-extrabold tracking-tight premium-text-gradient">
              NovaBoard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="premium-btn premium-btn-secondary">
              Sign In <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-40 pb-20 premium-container text-center">
        <div className="inline-block mb-4 animate-fade-in-up">
          <span className="premium-badge">✨ Redesigned Experience</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100">
          Discover <span className="premium-text-gradient">Premium</span> Products
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up delay-200" style={{ color: 'var(--text-muted)' }}>
          Explore our exclusive, handpicked collection. Elevate your lifestyle with NovaBoard's next-generation shopping experience.
        </p>
        <div className="mt-10 flex justify-center gap-4 animate-fade-in-up delay-300">
          <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="premium-btn premium-btn-primary">
            Start Shopping
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="premium-container pb-24">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up delay-200">
          <h2 className="text-3xl font-bold">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up delay-300">
          {products.map(product => {
            const discount = product.mrp > 0 ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
            const productReviews = product.reviews || [];
            const avgRating = productReviews.length > 0 ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1) : 4.0;

            return (
              <div key={product.id} onClick={() => navigate('/login')} className="premium-card cursor-pointer flex flex-col h-full group">
                
                {/* Image Container */}
                <div className="h-64 flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--glass-bg)' }}>
                  <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  {discount > 0 && (
                    <div className="absolute top-3 right-3 premium-badge bg-indigo-500/20 text-indigo-300 border-indigo-500/30 backdrop-blur-md">
                      {discount}% OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-yellow-400" style={{ background: 'rgba(250, 204, 21, 0.1)' }}>
                      <Star size={12} fill="currentColor" /> {avgRating}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({productReviews.length} reviews)</span>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-4 line-clamp-2 leading-snug flex-1 group-hover:text-indigo-400 transition-colors">{product.name}</h3>
                  
                  <div className="flex items-end justify-between mt-auto pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                    <div>
                      <div className="text-2xl font-black">₹{product.price.toLocaleString('en-IN')}</div>
                      {product.mrp > product.price && (
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span className="line-through" style={{ color: 'var(--text-muted)' }}>₹{product.mrp.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                    <button className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-110" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                      <ShoppingCart size={20} className="text-indigo-400 group-hover:text-white" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 relative z-10" style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-main)' }}>
        <div className="premium-container flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs" style={{ background: 'var(--gradient-brand)' }}>N</div>
            <span>&copy; {new Date().getFullYear()} NovaBoard Technologies</span>
          </div>
          <div>
            Crafted with ❤️ for a Premium Experience
          </div>
        </div>
      </footer>
    </div>
  );
}
