import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Check } from 'lucide-react';

export default function Checkout() {
  const [activeStep, setActiveStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('COD');
  const [loading, setLoading] = useState(false);
  
  // Payment Gateway State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const getTotal = () => cartTotal;

  const handleDeliverHere = () => {
    if(!name || !phone || !address) {
      alert('Please fill all address details');
      return;
    }
    setActiveStep(2);
  };

  const placeOrder = async () => {
    setLoading(true);
    if(!name || !phone || !address) {
      alert('Please fill all address details');
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    const { error } = await supabase.from('orders').insert([{ 
      user_id: userId,
      customer_name: name, 
      customer_phone: phone,
      phone: phone,
      address: address,
      payment_method: payment,
      total_amount: getTotal(),
      total: getTotal(),
      items: cart,
      status: 'Pending'
    }]);

    setLoading(false);
    if(error) {
      alert('Order failed: ' + error.message);
      console.log(error);
    } else {
      clearCart();
      navigate('/success');
    }
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.length < 16) return alert('Invalid card number');
    if (!expiry || !cvv) return alert('Please enter Expiry and CVV');
    
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        placeOrder();
      }, 1500);
    }, 2500);
  };

  return (
    <div style={{background: '#F1F3F6', minHeight: '100vh', paddingBottom: '40px'}}>
      
      {/* HEADER */}
      <div style={{
        background: '#2874F0', 
        color: 'white', 
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Checkout</div>
      </div>

      <div style={{
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        boxSizing: 'border-box'
      }}>

        {/* LEFT - FORM (Accordion) */}
        <div style={{flex: '2', minWidth: '300px'}}>
          
          {/* STEP 1: Delivery Address */}
          <div style={{
            background: 'white', 
            borderRadius: '2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            marginBottom: '16px'
          }}>
            <div style={{
              background: activeStep === 1 ? '#2874F0' : 'white',
              color: activeStep === 1 ? 'white' : '#878787',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: activeStep === 1 ? 'none' : '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  background: activeStep === 1 ? 'white' : '#f0f0f0',
                  color: activeStep === 1 ? '#2874F0' : '#878787',
                  width: '24px', height: '24px', borderRadius: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 'bold'
                }}>
                  1
                </div>
                <h2 style={{fontSize: '16px', fontWeight: '500', margin: 0, textTransform: 'uppercase'}}>
                  Delivery Address
                </h2>
                {activeStep > 1 && <Check size={20} color="#2874F0" />}
              </div>
              {activeStep > 1 && (
                <button onClick={() => setActiveStep(1)} style={{
                  background: 'none', border: 'none', color: '#2874F0', fontWeight: '500', cursor: 'pointer', textTransform: 'uppercase'
                }}>Change</button>
              )}
            </div>

            {activeStep === 1 ? (
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <input 
                    placeholder="Full Name" 
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                    style={{ flex: 1, padding: '12px', border: '1px solid #E0E0E0', borderRadius: '2px', outline: 'none', fontSize: '14px' }}
                  />
                  <input 
                    placeholder="10-digit Mobile Number" 
                    value={phone}
                    onChange={(e)=>setPhone(e.target.value)}
                    style={{ flex: 1, padding: '12px', border: '1px solid #E0E0E0', borderRadius: '2px', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <textarea 
                  placeholder="Address (Area and Street)" 
                  value={address}
                  onChange={(e)=>setAddress(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E0E0E0', borderRadius: '2px', outline: 'none', minHeight: '80px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '24px' }}
                />
                <button 
                  onClick={handleDeliverHere}
                  style={{
                    background: '#FB641B',
                    color: 'white',
                    padding: '16px 32px',
                    border: 'none',
                    borderRadius: '2px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  Deliver Here
                </button>
              </div>
            ) : (
              <div style={{ padding: '16px 24px 24px 64px', fontSize: '14px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{name} <span style={{ fontWeight: 'normal', marginLeft: '12px' }}>{phone}</span></div>
                <div>{address}</div>
              </div>
            )}
          </div>

          {/* STEP 2: Payment Options */}
          <div style={{
            background: 'white', 
            borderRadius: '2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              background: activeStep === 2 ? '#2874F0' : 'white',
              color: activeStep === 2 ? 'white' : '#878787',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                background: activeStep === 2 ? 'white' : '#f0f0f0',
                color: activeStep === 2 ? '#2874F0' : '#878787',
                width: '24px', height: '24px', borderRadius: '2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 'bold'
              }}>
                2
              </div>
              <h2 style={{fontSize: '16px', fontWeight: '500', margin: 0, textTransform: 'uppercase'}}>
                Payment Options
              </h2>
            </div>

            {activeStep === 2 && (
              <div style={{ padding: '24px' }}>
                <label style={{display: 'flex', alignItems: 'center', marginBottom: '24px', cursor: 'pointer', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '4px', background: payment === 'COD' ? '#f4f8ff' : 'white'}}>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={payment === 'COD'}
                    onChange={()=>setPayment('COD')}
                    style={{marginRight: '16px', width: '20px', height: '20px'}}
                  /> 
                  <span style={{ fontSize: '16px' }}>Cash on Delivery</span>
                </label>
                
                <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '4px', background: payment === 'CARD' ? '#f4f8ff' : 'white'}}>
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === 'CARD'}
                    onChange={()=>setPayment('CARD')}
                    style={{marginRight: '16px', width: '20px', height: '20px'}}
                  /> 
                  <span style={{ fontSize: '16px' }}>Credit / Debit Card (Secure)</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - PRICE DETAILS */}
        <div style={{flex: '1 1 300px'}}>
          <div style={{
            background: 'white', 
            borderRadius: '2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: '20px'
          }}>
            <h3 style={{fontSize: '16px', fontWeight: '500', color: '#878787', padding: '16px 24px', margin: 0, textTransform: 'uppercase', borderBottom: '1px solid #f0f0f0'}}>
              Price Details
            </h3>
            
            <div style={{ padding: '24px' }}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '16px'}}>
                <span>Price ({cart.length} items)</span>
                <span>₹{getTotal().toLocaleString('en-IN')}</span>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '16px'}}>
                <span>Delivery Charges</span>
                <span style={{color: '#388E3C'}}>Free</span>
              </div>
  
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', padding: '20px 0', borderTop: '1px dashed #E0E0E0', borderBottom: '1px dashed #E0E0E0', marginBottom: '20px'}}>
                <span>Total Amount</span>
                <span>₹{getTotal().toLocaleString('en-IN')}</span>
              </div>
  
              <div style={{ color: '#388E3C', fontWeight: '500', marginBottom: '24px' }}>
                Your order is eligible for Free Delivery.
              </div>

              {activeStep === 2 && (
                <button 
                  onClick={()=>{
                    if(payment === 'CARD'){
                      setShowPaymentModal(true);
                    } else {
                      placeOrder();
                    }
                  }}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px', 
                    background: '#FB641B',
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '2px', 
                    fontWeight: 'bold', 
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'PLACING ORDER...' : (payment === 'CARD' ? 'PAY NOW' : 'PLACE ORDER')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SIMULATED PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative' }}>
            {!paymentProcessing && !paymentSuccess && (
              <button onClick={() => setShowPaymentModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#878787' }}>&times;</button>
            )}
            
            {paymentSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '64px', height: '64px', background: '#388E3C', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Check size={40} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#212121', marginBottom: '8px' }}>Payment Successful</h2>
                <p style={{ color: '#878787' }}>Redirecting to order confirmation...</p>
              </div>
            ) : paymentProcessing ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#212121', marginBottom: '8px' }}>Processing Payment...</h2>
                <p style={{ color: '#878787' }}>Please do not refresh the page or hit the back button.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Secure Card Payment</h2>
                  <div style={{ background: '#f4f8ff', color: '#2874F0', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                    ₹{getTotal().toLocaleString('en-IN')}
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#878787', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Card Number</label>
                    <input type="text" placeholder="XXXX XXXX XXXX XXXX" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0,16))} required style={{ width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '16px', outline: 'none' }} />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#878787', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Expiry (MM/YY)</label>
                      <input type="text" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '16px', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#878787', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>CVV</label>
                      <input type="password" placeholder="•••" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0,3))} required style={{ width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '16px', outline: 'none', letterSpacing: '2px' }} />
                    </div>
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '14px', background: '#2874F0', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(40,116,240,0.3)' }}>
                    Pay ₹{getTotal().toLocaleString('en-IN')}
                  </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#878787', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  🔒 100% Secure Encrypted Payment
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}