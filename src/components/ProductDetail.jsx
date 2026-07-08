import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  useEffect(() => { 
    fetchProduct();
    fetchReviews();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUser(session.user);
    });
  }, [id]);

  const fetchProduct = async () => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    setProduct(data);

    if(data){
      const { data: recs } = await supabase
       .from('products')
       .select('*')
       .eq('category', data.category)
       .neq('id', data.id)
       .limit(8);
      setRecommendations(recs || []);
    }
  }

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(username)')
      .eq('product_id', id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setReviews(data);
    }
  };

  const handleAddToCart = (p) => {
    addToCart(p);
    alert(`${p.name} added to cart!`);
  }

  const submitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert('You must be logged in to leave a review.');
    if (!newReview.comment) return alert('Please enter a comment.');
    
    const { error } = await supabase
      .from('reviews')
      .insert([{ 
        product_id: id, 
        user_id: currentUser.id, 
        rating: newReview.rating, 
        comment: newReview.comment 
      }]);

    if (error) {
      alert('Error submitting review: ' + error.message);
    } else {
      alert('Review added successfully!');
      setNewReview({ rating: 5, comment: '' });
      fetchReviews(); // Refresh from DB
    }
  };

  if(!product) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F1F3F6' }}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const averageRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++ });

  return (
    <div style={{background: '#F1F3F6', minHeight: '100vh', paddingBottom: '40px'}}>
      
      {/* HEADER NAVBAR */}
      <div style={{ background: '#2874F0', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ fontSize: '20px', fontWeight: 'bold', fontStyle: 'italic', display: 'flex', alignItems: 'center' }}>
          NovaBoard
        </div>
        <button onClick={() => navigate('/shop')} style={{ background: 'transparent', border: 'none', color: 'white', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <ShoppingCart size={20} /> Cart
          {cart.length > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '35px', background: '#ff9f00', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
              {cart.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          )}
        </button>
      </div>

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 10px'}}>
        
        {/* MAIN PRODUCT AREA */}
        <div style={{display: 'flex', background: 'white', marginBottom: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
          
          {/* LEFT: IMAGE & BUY BUTTONS */}
          <div style={{ width: '40%', padding: '24px', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', border: '1px solid #f0f0f0', padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
               <img src={product.image_url} style={{width: '300px', height: '350px', objectFit: 'contain'}}/>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={()=>handleAddToCart(product)} style={{flex: 1, padding: '16px', background: '#ff9f00', color: 'white', border: 'none', borderRadius: '2px', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'}}>
                <ShoppingCart size={18} /> ADD TO CART
              </button>
              <button onClick={()=>{ handleAddToCart(product); navigate('/checkout'); }} style={{flex: 1, padding: '16px', background: '#fb641b', color: 'white', border: 'none', borderRadius: '2px', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'}}>
                BUY NOW
              </button>
            </div>
          </div>
          
          {/* RIGHT: DETAILS */}
          <div style={{ width: '60%', padding: '24px' }}>
            <div style={{ fontSize: '14px', color: '#878787', marginBottom: '8px' }}>Home / {product.category} / {product.name}</div>
            <h1 style={{fontSize: '22px', fontWeight: '500', color: '#212121', marginBottom: '12px'}}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ background: '#388E3C', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
                {averageRating > 0 ? averageRating : 'No Ratings'} <Star size={12} fill="white" />
              </span>
              <span style={{ color: '#878787', fontSize: '14px', fontWeight: '500' }}>
                {reviews.length} Ratings & Reviews
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
              <h2 style={{fontSize: '28px', fontWeight: '500', color: '#212121', margin: 0}}>₹{product.price.toLocaleString('en-IN')}</h2>
              <span style={{ color: '#878787', textDecoration: 'line-through', fontSize: '16px' }}>₹{(product.price * 1.3).toLocaleString('en-IN')}</span>
              <span style={{ color: '#388E3C', fontWeight: '500', fontSize: '16px' }}>30% off</span>
            </div>

            {/* HIGHLIGHTS */}
            <div style={{ display: 'flex', gap: '40px', marginBottom: '32px' }}>
              <div style={{ color: '#878787', width: '80px', fontWeight: '500', fontSize: '14px' }}>Highlights</div>
              <ul style={{ color: '#212121', fontSize: '14px', paddingLeft: '16px', margin: 0, lineHeight: '2' }}>
                <li>Category: {product.category}</li>
                <li>Premium Quality Guaranteed</li>
                <li>7 Days Replacement Policy</li>
                <li>Cash on Delivery available</li>
              </ul>
            </div>

            {/* DESCRIPTION */}
            <div style={{ display: 'flex', gap: '40px', marginBottom: '24px' }}>
              <div style={{ color: '#878787', width: '80px', fontWeight: '500', fontSize: '14px' }}>Description</div>
              <div style={{ color: '#212121', fontSize: '14px', lineHeight: '1.6', flex: 1 }}>
                {product.description}
              </div>
            </div>
            
            {/* SPECS */}
            <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', marginTop: '32px' }}>
              <div style={{ padding: '24px', fontSize: '24px', fontWeight: '500', borderBottom: '1px solid #f0f0f0' }}>Specifications</div>
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>General</div>
                <div style={{ display: 'flex', marginBottom: '12px', fontSize: '14px' }}>
                  <div style={{ width: '30%', color: '#878787' }}>Model Name</div>
                  <div style={{ width: '70%', color: '#212121' }}>{product.name}</div>
                </div>
                <div style={{ display: 'flex', marginBottom: '12px', fontSize: '14px' }}>
                  <div style={{ width: '30%', color: '#878787' }}>Inventory</div>
                  <div style={{ width: '70%', color: '#212121' }}>{product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RATINGS AND REVIEWS */}
        <div style={{background: 'white', padding: '24px', marginBottom: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
            <h2 style={{fontSize: '24px', fontWeight: '500'}}>Ratings & Reviews</h2>
          </div>

          <div style={{ display: 'flex', gap: '40px', borderBottom: '1px solid #f0f0f0', paddingBottom: '32px', marginBottom: '24px' }}>
            
            {/* Visual Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '150px' }}>
              <div style={{ fontSize: '48px', fontWeight: '500' }}>{averageRating} <Star size={32} fill="black" /></div>
              <div style={{ color: '#878787', fontSize: '14px', marginTop: '8px' }}>{reviews.length} Ratings</div>
            </div>

            <div style={{ flex: 1, maxWidth: '300px' }}>
              {[5,4,3,2,1].map(star => {
                const count = ratingCounts[star];
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', fontSize: '12px' }}>
                    <div style={{ width: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>{star} <Star size={10} fill="black" /></div>
                    <div style={{ flex: 1, background: '#f0f0f0', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ background: star >= 3 ? '#388E3C' : (star === 2 ? '#ff9f00' : '#ff6161'), height: '100%', width: `${pct}%` }}></div>
                    </div>
                    <div style={{ width: '30px', color: '#878787', textAlign: 'right' }}>{count}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ flex: 1, borderLeft: '1px solid #f0f0f0', paddingLeft: '40px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Review this product</h3>
              {currentUser ? (
                <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                  <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} style={{ padding: '12px', border: '1px solid #e0e0e0', borderRadius: '4px', outline: 'none' }}>
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Terrible</option>
                  </select>
                  <textarea placeholder="Write your review here..." value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} style={{ padding: '12px', border: '1px solid #e0e0e0', borderRadius: '4px', minHeight: '80px', outline: 'none' }} required />
                  <button type="submit" style={{ padding: '12px 24px', background: 'white', color: '#2874F0', border: '1px solid #e0e0e0', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-start', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>RATE PRODUCT</button>
                </form>
              ) : (
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '14px' }}>
                  Please <span onClick={() => navigate('/')} style={{ color: '#2874F0', cursor: 'pointer', fontWeight: 'bold' }}>log in</span> to review this product.
                </div>
              )}
            </div>
          </div>

          <div>
            {reviews.length === 0 ? <p style={{ color: '#878787', padding: '24px 0' }}>No reviews yet. Be the first to review this product!</p> :
              reviews.map((rev) => (
                <div key={rev.id} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ background: rev.rating >= 3 ? '#388E3C' : (rev.rating === 2 ? '#ff9f00' : '#ff6161'), color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {rev.rating} <Star size={10} fill="white" />
                    </span>
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>{rev.rating >= 4 ? 'Awesome' : (rev.rating === 3 ? 'Good' : 'Needs Improvement')}</span>
                  </div>
                  <p style={{ color: '#212121', lineHeight: '1.4', fontSize: '14px', marginBottom: '16px' }}>{rev.comment}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#878787' }}>
                    <span style={{ fontWeight: '500' }}>{rev.profiles?.username || 'Verified Customer'}</span>
                    <span>{new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'})}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* YOU MIGHT BE INTERESTED IN (Horizontal Scroll) */}
        {recommendations.length > 0 && (
          <div style={{background: 'white', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            <h2 style={{fontSize: '22px', fontWeight: '500', marginBottom: '24px'}}>Similar Products</h2>
            
            <div style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '16px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {recommendations.map(rec => (
                <div key={rec.id} onClick={()=>navigate(`/product/${rec.id}`)} style={{ flex: '0 0 200px', cursor: 'pointer', padding: '16px', textAlign: 'center', border: '1px solid #f0f0f0', borderRadius: '4px', transition: 'box-shadow 0.2s', ':hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}}>
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <img src={rec.image_url} style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}/>
                  </div>
                  <p style={{fontSize: '14px', fontWeight: '400', color: '#212121', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px', marginBottom: '8px'}}>{rec.name}</p>
                  <p style={{fontSize: '16px', fontWeight: '500', color: '#212121'}}>₹{rec.price.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}