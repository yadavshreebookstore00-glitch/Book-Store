import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaUser,
  FaPhone,
  FaHome,
  FaCity,
  FaLandmark,
  FaMapPin,
  FaGlobeAsia,
  FaLock,
  FaShieldAlt,
  FaExclamationCircle,
  FaSpinner,
  FaArrowRight,
  FaShoppingBag,
  FaSignInAlt,
  FaReceipt,
  FaWallet,
} from 'react-icons/fa';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './Checkout.module.css';

// COD dobara chalu karna ho to true kar do
const ENABLE_COD = false;
const STORE_NAME = 'Apna Mens Wear';

// ===== Input with icon =====
const Field = ({ icon, full, ...props }) => (
  <div className={`${styles.field} ${full ? styles.full : ''}`}>
    <span className={styles.fieldIcon}>{icon}</span>
    <input className={styles.input} {...props} />
  </div>
);

// ===== Payment option =====
const PayOption = ({ value, active, onChange, icon, name, desc }) => (
  <label className={`${styles.payOption} ${active ? styles.payActive : ''}`}>
    <input
      type="radio"
      name="payment"
      value={value}
      checked={active}
      onChange={onChange}
    />
    <span className={styles.payIcon}>{icon}</span>
    <div>
      <p className={styles.payName}>{name}</p>
      <p className={styles.payDesc}>{desc}</p>
    </div>
  </label>
);

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
      <div className={styles.centerBox}>
        <h2>Please login to checkout</h2>
        <Link to="/login" className={styles.centerBtn}>
          <FaSignInAlt /> Login
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.centerBox}>
        <h2>Nothing to Checkout</h2>
        <Link to="/shop" className={styles.centerBtn}>
          <FaShoppingBag /> Browse Products
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
        name: STORE_NAME,
        description: `Order of ${items.length} item(s)`,
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

  const isOnline = paymentMethod === 'Razorpay';

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        <FaLock /> Checkout
      </h1>

      {error && (
        <div className={styles.error}>
          <FaExclamationCircle /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.layout}>
          {/* ===== Left: Address + Payment ===== */}
          <div>
            {/* Shipping Address */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <FaMapMarkerAlt /> Shipping Address
              </h3>

              <div className={styles.fields}>
                <Field
                  icon={<FaUser />}
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <Field
                  icon={<FaPhone />}
                  type="tel"
                  inputMode="numeric"
                  name="phone"
                  placeholder="Phone (10 digits) *"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={10}
                  required
                />
                <Field
                  full
                  icon={<FaHome />}
                  type="text"
                  name="street"
                  placeholder="Street / House No. *"
                  autoComplete="street-address"
                  value={form.street}
                  onChange={handleChange}
                  required
                />
                <Field
                  icon={<FaCity />}
                  type="text"
                  name="city"
                  placeholder="City *"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
                <Field
                  icon={<FaLandmark />}
                  type="text"
                  name="state"
                  placeholder="State *"
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
                <Field
                  icon={<FaMapPin />}
                  type="text"
                  inputMode="numeric"
                  name="pincode"
                  placeholder="Pincode (6 digits) *"
                  autoComplete="postal-code"
                  value={form.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  required
                />
                <Field
                  icon={<FaGlobeAsia />}
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={form.country}
                  readOnly
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <FaWallet /> Payment Method
              </h3>

              <PayOption
                value="Razorpay"
                active={isOnline}
                onChange={(e) => setPaymentMethod(e.target.value)}
                icon={<FaCreditCard />}
                name="Pay Online (Razorpay)"
                desc="Card, UPI, Netbanking, Wallets"
              />

              {ENABLE_COD && (
                <PayOption
                  value="COD"
                  active={!isOnline}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  icon={<FaMoneyBillWave />}
                  name="Cash on Delivery"
                  desc="Pay when your order arrives"
                />
              )}
            </div>
          </div>

          {/* ===== Right: Order Summary ===== */}
          <div className={styles.summary}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <FaReceipt /> Order Summary
              </h3>

              <div className={styles.items}>
                {items.map((item, idx) => (
                  <div key={idx} className={styles.item}>
                    <img src={item.image} alt={item.title} className={styles.itemImg} />
                    <div className={styles.itemBody}>
                      <p className={styles.itemTitle}>{item.title}</p>
                      <p className={styles.itemMeta}>
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <span className={styles.itemTotal}>
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.row}>
                <span>Subtotal</span>
                <span>₹{itemsPrice.toFixed(0)}</span>
              </div>
              <div className={styles.row}>
                <span>Shipping</span>
                <span className={shippingPrice === 0 ? styles.free : ''}>
                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                </span>
              </div>

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalValue}>₹{totalPrice.toFixed(0)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${styles.payBtn} ${isOnline ? '' : styles.cod}`}
              >
                {loading ? (
                  <>
                    <FaSpinner className={styles.spin} /> Processing...
                  </>
                ) : isOnline ? (
                  <>
                    <FaLock /> Pay ₹{totalPrice.toFixed(0)}
                  </>
                ) : (
                  <>
                    Place COD Order <FaArrowRight />
                  </>
                )}
              </button>

              <p className={styles.secure}>
                <FaShieldAlt /> 100% secure payments
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;