import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Inline styles me media query nahi chalti, isliye responsive CSS yahan classes me hai
const responsiveCss = `
  .co-page { padding: 30px 20px; max-width: 1100px; margin: 0 auto; }
  .co-title { color: #1a237e; font-weight: 800; margin-bottom: 25px; font-size: 26px; }
  .co-layout { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr); gap: 25px; align-items: start; }
  .co-card { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
  .co-card + .co-card { margin-top: 20px; }
  .co-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .co-full { grid-column: span 2; }
  .co-summary { position: sticky; top: 80px; height: fit-content; }
  .co-input { min-width: 0; box-sizing: border-box; }
  .co-input:focus { border-color: #1a237e !important; }
  .co-pay-btn { min-height: 48px; }
  .co-item-title { word-break: break-word; }

  /* Tablet & niche */
  @media (max-width: 900px) {
    .co-layout { grid-template-columns: minmax(0, 1fr); gap: 20px; }
    .co-summary { position: static; }
  }

  /* Mobile */
  @media (max-width: 600px) {
    .co-page { padding: 18px 12px 28px; }
    .co-title { font-size: 21px; margin-bottom: 16px; }
    .co-card { padding: 16px; border-radius: 10px; }
    .co-card + .co-card { margin-top: 14px; }
    .co-fields { grid-template-columns: minmax(0, 1fr); gap: 10px; }
    .co-full { grid-column: auto; }
    /* 16px se iOS input focus pe zoom nahi karta */
    .co-input { font-size: 16px !important; padding: 12px 14px !important; }
    .co-pay-btn { font-size: 16px !important; min-height: 50px; }
    .co-radio { padding: 12px !important; }
  }
`;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  // Buy Now mode check
  const buyNowData = location.state?.buyNow ? location.state.item : null;

  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set items
  useEffect(() => {
    if (buyNowData) {
      setItems([buyNowData]);
    } else if (cart.items) {
      setItems(
        cart.items.map((item) => ({
          book: item.book._id,
          title: item.book.title,
          image: item.book.image,
          price: item.price,
          quantity: item.quantity,
        }))
      );
    }
  }, [buyNowData, cart]);

  if (!user) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Please login to checkout</h2>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#1a237e', marginBottom: '15px' }}>Nothing to Checkout</h2>
        <Link to="/shop" style={{ background: '#1a237e', color: '#fff', padding: '12px 30px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>
          Browse Books
        </Link>
      </div>
    );
  }

  const itemsPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const totalPrice = itemsPrice + shippingPrice;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===== Validate =====
  const validateForm = () => {
    if (!form.name || !form.phone || !form.street || !form.city || !form.state || !form.pincode) {
      setError('Please fill all shipping details');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError('Please enter valid 10-digit mobile number');
      return false;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      setError('Please enter valid 6-digit pincode');
      return false;
    }
    return true;
  };

  // ===== Razorpay Payment =====
  const handleRazorpayPayment = async () => {
    setError('');
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Create Razorpay order
      const { data: orderData } = await api.post('/orders/razorpay', {
        amount: totalPrice,
      });

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Yadav Shree Book Store',
        description: `Order of ${items.length} book(s)`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // 3. Verify payment + create order
            await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: form,
              items,
            });

            // 4. Success
            if (!buyNowData) await clearCart();
            navigate('/orders', { replace: true });
            alert('🎉 Payment successful! Order placed.');
          } catch (err) {
            setError('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: form.name,
          email: user.email,
          contact: form.phone,
        },
        theme: { color: '#1a237e' },
      };

      if (!window.Razorpay) {
        setError('Razorpay SDK not loaded. Please refresh.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment failed');
      setLoading(false);
    }
  };

  // ===== COD Order =====
  const handleCodOrder = async () => {
    setError('');
    if (!validateForm()) return;

    if (!window.confirm('Confirm Cash on Delivery order?')) return;

    setLoading(true);
    try {
      await api.post('/orders/cod', {
        shippingAddress: form,
        items,
      });

      if (!buyNowData) await clearCart();
      navigate('/orders', { replace: true });
      alert('✅ Order placed! Pay on delivery.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'Razorpay') handleRazorpayPayment();
    else handleCodOrder();
  };

  return (
    <div className="co-page">
      <style>{responsiveCss}</style>

      <h1 className="co-title">Checkout</h1>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontWeight: 600, fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="co-layout">
          {/* Left - Address + Payment */}
          <div>
            {/* Shipping Address */}
            <div className="co-card">
              <h3 style={{ color: '#1a237e', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaMapMarkerAlt /> Shipping Address
              </h3>

              <div className="co-fields">
                <input className="co-input" type="text" name="name" placeholder="Full Name *" autoComplete="name" value={form.name} onChange={handleChange} required style={inputStyle} />
                <input className="co-input" type="tel" inputMode="numeric" name="phone" placeholder="Phone (10 digits) *" autoComplete="tel" value={form.phone} onChange={handleChange} required maxLength={10} style={inputStyle} />
                <input className="co-input co-full" type="text" name="street" placeholder="Street / House No. *" autoComplete="street-address" value={form.street} onChange={handleChange} required style={inputStyle} />
                <input className="co-input" type="text" name="city" placeholder="City *" autoComplete="address-level2" value={form.city} onChange={handleChange} required style={inputStyle} />
                <input className="co-input" type="text" name="state" placeholder="State *" autoComplete="address-level1" value={form.state} onChange={handleChange} required style={inputStyle} />
                <input className="co-input" type="text" inputMode="numeric" name="pincode" placeholder="Pincode (6 digits) *" autoComplete="postal-code" value={form.pincode} onChange={handleChange} required maxLength={6} style={inputStyle} />
                <input className="co-input" type="text" name="country" placeholder="Country" value={form.country} onChange={handleChange} readOnly style={{ ...inputStyle, background: '#f5f5f5' }} />
              </div>
            </div>

            {/* Payment Method */}
            <div className="co-card">
              <h3 style={{ color: '#1a237e', fontWeight: 800, marginBottom: '20px' }}>Payment Method</h3>

              <label className="co-radio" style={paymentOptionStyle(paymentMethod === 'Razorpay')}>
                <input type="radio" name="payment" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                <FaCreditCard style={{ color: '#1a237e', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#1a237e' }}>Pay Online (Razorpay)</div>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>Card, UPI, Netbanking, Wallets</div>
                </div>
              </label>

             
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="co-summary">
            <div className="co-card">
              <h3 style={{ color: '#1a237e', fontWeight: 800, marginBottom: '20px' }}>Order Summary</h3>

              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                  <img src={item.image} alt={item.title} style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '5px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="co-item-title" style={{ fontSize: '13px', fontWeight: 700, color: '#1a237e', marginBottom: '3px' }}>{item.title}</p>
                    <p style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span>₹{itemsPrice.toFixed(0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', fontWeight: 600 }}>
                <span style={{ color: '#666' }}>Shipping</span>
                <span style={{ color: shippingPrice === 0 ? '#2e7d32' : '#333' }}>
                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                </span>
              </div>
              <div style={{ borderTop: '2px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ color: '#1a237e', fontWeight: 800 }}>Total</span>
                <span style={{ color: '#f57c00', fontWeight: 800, fontSize: '20px' }}>₹{totalPrice.toFixed(0)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="co-pay-btn"
                style={{
                  width: '100%',
                  background: loading ? '#999' : paymentMethod === 'Razorpay' ? '#1a237e' : '#2e7d32',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.5px',
                }}
              >
                {loading
                  ? '⏳ Processing...'
                  : paymentMethod === 'Razorpay'
                  ? `Pay ₹${totalPrice.toFixed(0)}`
                  : 'Place COD Order →'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '11px 14px',
  border: '1.5px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
};

const paymentOptionStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '15px',
  border: `2px solid ${active ? '#1a237e' : '#ddd'}`,
  borderRadius: '10px',
  cursor: 'pointer',
  marginBottom: '12px',
  background: active ? '#e8eaf6' : '#fff',
  transition: 'all 0.2s',
});

export default Checkout;