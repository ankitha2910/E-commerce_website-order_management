import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { ShoppingCart } from 'lucide-react';

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
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#09090b]/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              N
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              NovaBoard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero / Header for Products */}
      <div className="relative pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
          Discover Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Products</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Explore our exclusive collection. Log in to start shopping, track orders, and manage your wishlist.
        </p>
      </div>

      {/* Products Grid */}
      <div className="px-6 md:px-12 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {products.map(product => {
            const discount = product.mrp > 0 ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
            const productReviews = product.reviews || [];
            const avgRating = productReviews.length > 0 ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1) : 4.0;

            return (
              <div key={product.id} onClick={() => navigate('/login')} className="group bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col relative">
                
                {/* Image Container */}
                <div className="h-56 bg-white/5 flex items-center justify-center p-6 relative overflow-hidden group-hover:bg-white/10 transition-colors">
                  <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-xs font-bold text-yellow-400">
                      ★ {avgRating}
                    </div>
                    <span className="text-xs text-gray-500">({productReviews.length})</span>
                  </div>
                  
                  <h3 className="font-medium text-gray-200 text-sm mb-4 line-clamp-2 leading-relaxed flex-1 group-hover:text-indigo-300 transition-colors">{product.name}</h3>
                  
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <div className="text-lg font-black text-white">₹{product.price.toLocaleString('en-IN')}</div>
                      {product.mrp > product.price && (
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="text-gray-500 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                          <span className="text-emerald-400 font-bold">{discount}% OFF</span>
                        </div>
                      )}
                    </div>
                    <button className="w-10 h-10 rounded-full bg-indigo-600/50 text-white flex items-center justify-center shadow-lg transition-colors group-hover:bg-indigo-600">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#09090b] py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-xs">N</div>
            <span>&copy; {new Date().getFullYear()} NovaBoard Technologies</span>
          </div>
        </div>
      </footer>
      
      {/* Custom Animations CSS */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

