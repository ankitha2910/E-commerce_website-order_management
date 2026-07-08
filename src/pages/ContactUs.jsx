import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUs() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/account');
    }, 2000);
  };

  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: '#2874F0', color: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <button onClick={() => navigate('/account')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Contact Us</div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* LEFT - INFO */}
        <div style={{ flex: '1 1 300px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '400', marginBottom: '24px', color: '#0f172a' }}>We're here to help</h1>
          <p style={{ color: '#565959', fontSize: '16px', lineHeight: '1.5', marginBottom: '32px' }}>
            Have a question about your order, a return, or a product? Our customer service team is available 24/7 to assist you.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', background: '#e0f2fe', color: '#0284c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>Phone Support</h3>
                <p style={{ margin: 0, color: '#565959', fontSize: '14px' }}>7569817633</p>
                <p style={{ margin: '4px 0 0 0', color: '#878787', fontSize: '12px' }}>Available 24/7</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', background: '#fce7f3', color: '#db2777', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>Email Support</h3>
                <p style={{ margin: 0, color: '#565959', fontSize: '14px' }}>ankithkanchala06@gmail.com</p>
                <p style={{ margin: '4px 0 0 0', color: '#878787', fontSize: '12px' }}>Usually replies within 2 hours</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', background: '#f3f4f6', color: '#4b5563', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>Headquarters</h3>
                <p style={{ margin: 0, color: '#565959', fontSize: '14px' }}>krupanandha nagar, Anantapur, 515001</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - FORM */}
        <div style={{ flex: '2 1 400px' }}>
          {submitted ? (
             <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '32px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: '#10b981', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px' }}>✓</div>
                <h2 style={{ color: '#065f46', margin: '0 0 8px 0', fontSize: '20px' }}>Message Sent!</h2>
                <p style={{ color: '#047857', margin: 0, fontSize: '14px' }}>Thank you for reaching out. We will get back to you shortly.</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: 'white', border: '1px solid #d5d9d9', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 20px 0', color: '#0f172a' }}>Send us a message</h2>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px', color: '#0f172a' }}>Subject</label>
                <select required style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid #888C8C', fontSize: '14px', outline: 'none', background: '#f0f2f2' }}>
                  <option value="">Select an option</option>
                  <option value="order">Where is my order?</option>
                  <option value="return">Returns and Refunds</option>
                  <option value="product">Product Information</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px', color: '#0f172a' }}>Order Number (Optional)</label>
                <input type="text" placeholder="e.g. 12345678" style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid #888C8C', fontSize: '14px', outline: 'none', boxShadow: '0 1px 2px rgba(15,17,17,0.15) inset' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px', color: '#0f172a' }}>How can we help?</label>
                <textarea required placeholder="Please describe your issue..." style={{ width: '100%', padding: '10px 14px', borderRadius: '4px', border: '1px solid #888C8C', fontSize: '14px', outline: 'none', minHeight: '120px', resize: 'vertical', boxShadow: '0 1px 2px rgba(15,17,17,0.15) inset' }} />
              </div>

              <button type="submit" style={{ width: '100%', background: '#FFD814', color: '#0f172a', border: '1px solid #FCD200', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 2px 5px rgba(15,17,17,0.15)' }}>
                Send Message
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
