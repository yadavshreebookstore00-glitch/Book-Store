import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#1a237e', marginBottom: '15px' }}>Please Login</h2>
        <p style={{ color: '#666', marginBottom: '25px', fontWeight: 500 }}>
          Login to view your cart
        </p>
        <Link to="/login" style={{ background: '#1a237e', color: '#fff', padding: '12px 30px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '80px', textAlign: 'center', fontWeight: 600 }}>Loading cart...</div>;
  }

  const items = cart.items || [];
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = totalPrice > 500 ? 0 : 50;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <FaShoppingBag style={{ fontSize: '60px', color: '#ddd', marginBottom: '20px' }} />
        <h2 style={{ color: '#1a237e', marginBottom: '10px' }}>Your Cart is Empty</h2>
        <p style={{ color: '#666', marginBottom: '30px', fontWeight: 500 }}>
          Add some books to get started
        </p>
        <Link to="/shop" style={{ background: '#1a237e', color: '#fff', padding: '12px 30px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#1a237e', fontWeight: 800, marginBottom: '25px', fontSize: '26px' }}>
        Shopping Cart ({items.length})
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '25px' }}>
        {/* Cart Items */}
        <div>
          {items.map((item) => {
            const book = item.book;
            if (!book) return null;

            return (
              <div
                key={book._id}
                style={{
                  display: 'flex',
                  gap: '15px',
                  background: '#fff',
                  padding: '15px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  marginBottom: '15px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <img
                  src={book.image}
                  alt={book.title}
                  style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <Link to={`/book/${book.slug || book._id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ color: '#1a237e', fontWeight: 700, fontSize: '15px', marginBottom: '5px' }}>
                      {book.title}
                    </h3>
                  </Link>
                  <p style={{ color: '#f57c00', fontWeight: 800, fontSize: '18px', marginBottom: '10px' }}>
                    ₹{item.price}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                      <button
                        onClick={() => updateQuantity(book._id, Math.max(1, item.quantity - 1))}
                        style={{ background: '#f5f5f5', border: 'none', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        <FaMinus size={10} />
                      </button>
                      <span style={{ width: '40px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(book._id, item.quantity + 1)}
                        style={{ background: '#f5f5f5', border: 'none', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(book._id)}
                      style={{
                        background: '#ffebee',
                        color: '#c62828',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <FaTrash size={11} /> Remove
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <p style={{ color: '#666', fontSize: '12px', fontWeight: 600 }}>Subtotal</p>
                  <p style={{ color: '#1a237e', fontWeight: 800, fontSize: '17px' }}>
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div style={{ position: 'sticky', top: '80px', height: 'fit-content' }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#1a237e', fontWeight: 800, fontSize: '18px', marginBottom: '20px' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ color: '#666' }}>Subtotal</span>
              <span style={{ color: '#333' }}>₹{totalPrice.toFixed(0)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ color: '#666' }}>Shipping</span>
              <span style={{ color: shipping === 0 ? '#2e7d32' : '#333' }}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>

            {shipping > 0 && (
              <p style={{ background: '#fff3e0', color: '#f57c00', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, marginBottom: '15px' }}>
                Add ₹{500 - totalPrice} more for FREE shipping!
              </p>
            )}

            <div style={{ borderTop: '2px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#1a237e', fontWeight: 800, fontSize: '16px' }}>Total</span>
              <span style={{ color: '#f57c00', fontWeight: 800, fontSize: '20px' }}>₹{grandTotal.toFixed(0)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              style={{
                width: '100%',
                background: '#1a237e',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.5px',
              }}
            >
              Proceed to Checkout →
            </button>

            <Link
              to="/shop"
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: '15px',
                color: '#1a237e',
                fontWeight: 700,
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;