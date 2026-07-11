import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white font-sans selection:bg-indigo-500/30 overflow-hidden relative transition-colors duration-300">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[150px]" />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              N
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              NovaBoard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-all text-xl" title="Toggle Theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 border border-gray-300 dark:border-white/10 rounded-full backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 mb-8 backdrop-blur-sm animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">NovaBoard v2.0 is live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400 drop-shadow-sm">
              E-Commerce
            </span> Experience
          </h1>
          
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            The all-in-one platform to manage your store, track orders in real-time, and discover premium products with an unparalleled interface.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link to="/login" className="px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:scale-105 transition-all duration-300">
              Get Started for Free
            </Link>
            <a href="#features" className="px-8 py-4 text-base font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 rounded-full backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2 group">
              Explore Platform
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Stats/Showcase Banner */}
      <div className="border-y border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-300 dark:divide-white/10">
            <div>
              <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">99.9%</div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uptime</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">20</div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">24/7</div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Support</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">0ms</div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Latency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Designed for scale. <br/><span className="text-gray-500">Built for speed.</span></h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Everything you need to manage your business efficiently, packaged in a gorgeous, modern interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-3xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm relative overflow-hidden shadow-sm dark:shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[50px] -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20 dark:group-hover:bg-indigo-500/40"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/20">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Premium Storefront</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Give your customers a world-class shopping experience with lightning-fast product loading and seamless checkout flows.</p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-3xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm relative overflow-hidden md:translate-y-8 shadow-sm dark:shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[50px] -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/40"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-purple-500/20">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Live Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Track your business growth in real-time. Make data-driven decisions with powerful admin dashboards and order tracking.</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-3xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm relative overflow-hidden shadow-sm dark:shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[50px] -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/40"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Enterprise Security</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Rest easy knowing your store is protected by industry-leading security protocols and role-based access controls.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-100 dark:to-indigo-900/20"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Ready to transform your business?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">Join thousands of merchants already using NovaBoard to power their stores.</p>
          <Link to="/login" className="inline-block px-10 py-5 text-lg font-bold text-gray-900 dark:text-white bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 border border-gray-300 dark:border-white/20 rounded-full backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105">
            Create Your Account Today
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#09090b] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-medium text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-xs">N</div>
            <span>&copy; {new Date().getFullYear()} NovaBoard Technologies</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
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
