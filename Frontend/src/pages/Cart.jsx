import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingBag,
  FaArrowRight,
  FaTruck,
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const FREE_SHIPPING_MIN = 500;
const SHIPPING_FEE = 50;

const css = `
  .ct-page { padding: 18px 20px 48px; max-width: 1100px; margin: 0 auto; box-sizing: border-box; }
  .ct-title { color: #1a237e; font-weight: 800; font-size: 22px; margin: 0 0 14px; }
  .ct-title span { color: #999; font-weight: 700; font-size: 15px; }

  .ct-layout { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(280px, 1fr); gap: 18px; align-items: start; }

  /* ===== Items ===== */
  .ct-list { display: flex; flex-direction: column; gap: 10px; min-width: 0; }

  .ct-card { display: flex; gap: 14px; background: #fff; padding: 12px; border-radius: 12px; border: 1px solid #ececf3; min-width: 0; transition: border-color 0.2s, box-shadow 0.2s; }
  .ct-card:hover { border-color: #c5cae9; box-shadow: 0 6px 18px rgba(26, 35, 126, 0.08); }

  /* Book-jaisa image */
  .ct-img { position: relative; flex: 0 0 82px; width: 82px; aspect-ratio: 3 / 4; align-self: flex-start; display: block; overflow: hidden; border-radius: 3px 8px 8px 3px; background: #f1f2f8; box-shadow: 2px 4px 10px rgba(26, 35, 126, 0.18); }
  .ct-img::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: linear-gradient(90deg, rgba(0,0,0,0.2), rgba(255,255,255,0.15) 65%, transparent); z-index: 1; pointer-events: none; }
  .ct-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .ct-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .ct-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  .ct-name { font-size: 14.5px; font-weight: 700; color: #1a237e; margin: 0; line-height: 1.3; text-decoration: none; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
  .ct-name:hover { color: #f57c00; }
  .ct-unit { font-size: 12px; color: #777; font-weight: 600; margin: 3px 0 0; }

  .ct-remove { flex-shrink: 0; width: 30px; height: 30px; border-radius: 8px; border: none; background: #ffebee; color: #c62828; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s, color 0.2s; }
  .ct-remove:hover { background: #c62828; color: #fff; }

  .ct-bottom { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 10px; }
  .ct-qty { display: inline-flex; align-items: center; border: 1.5px solid #e0e0e6; border-radius: 8px; overflow: hidden; background: #fff; }
  .ct-qty button { background: #f7f7fa; border: none; width: 32px; height: 32px; cursor: pointer; color: #1a237e; display: flex; align-items: center; justify-content: center; }
  .ct-qty button:hover:not(:disabled) { background: #e8eaf6; }
  .ct-qty button:disabled { opacity: 0.4; cursor: not-allowed; }
  .ct-qty span { min-width: 36px; text-align: center; font-weight: 800; font-size: 14px; color: #1a237e; }
  .ct-sub { font-size: 17px; font-weight: 800; color: #f57c00; line-height: 1; }

  /* ===== Summary ===== */
  .ct-summary { position: sticky; top: 80px; background: #fff; padding: 18px; border-radius: 12px; border: 1px solid #ececf3; }
  .ct-summary h3 { color: #1a237e; font-weight: 800; font-size: 16px; margin: 0 0 14px; }
  .ct-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; font-weight: 600; }
  .ct-row span:first-child { color: #666; }
  .ct-free { color: #2e7d32; }

  .ct-ship { background: #fff8ef; border-radius: 10px; padding: 10px 12px; margin: 4px 0 14px; }
  .ct-ship-text { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; color: #e65100; margin: 0 0 8px; }
  .ct-ship.done { background: #e8f5e9; }
  .ct-ship.done .ct-ship-text { color: #2e7d32; margin: 0; }
  .ct-bar-track { height: 6px; border-radius: 6px; background: #ffe0b2; overflow: hidden; }
  .ct-bar-fill { height: 100%; background: #f57c00; border-radius: 6px; transition: width 0.3s; }

  .ct-total { border-top: 1.5px dashed #e3e3ea; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .ct-total span:first-child { color: #1a237e; font-weight: 800; font-size: 15px; }
  .ct-total span:last-child { color: #f57c00; font-weight: 800; font-size: 22px; }

  .ct-checkout { width: 100%; background: #1a237e; color: #fff; border: none; height: 46px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; transition: background 0.2s; }
  .ct-checkout:hover { background: #3949ab; }
  .ct-continue { display: block; text-align: center; margin-top: 12px; color: #1a237e; font-weight: 700; font-size: 13px; text-decoration: none; }

  /* Mobile bottom bar (desktop par hidden) */
  .ct-bar { display: none; }

  /* ===== States ===== */
  .ct-state { padding: 70px 20px; text-align: center; max-width: 420px; margin: 0 auto; }
  .ct-state-icon { width: 84px; height: 84px; border-radius: 50%; background: #e8eaf6; color: #1a237e; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 18px; }
  .ct-state h2 { color: #1a237e; margin: 0 0 8px; font-weight: 800; font-size: 20px; }
  .ct-state p { color: #666; margin: 0 0 22px; font-weight: 500; font-size: 14px; }
  .ct-state a { background: #1a237e; color: #fff; padding: 11px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; }

  /* ===== Tablet ===== */
  @media (max-width: 860px) {
    .ct-layout { grid-template-columns: minmax(0, 1fr); gap: 14px; }
    .ct-summary { position: static; }
  }

  /* ===== Mobile ===== */
  @media (max-width: 520px) {
    .ct-page { padding: 14px 12px 100px; }
    .ct-title { font-size: 19px; margin-bottom: 12px; }
    .ct-card { gap: 12px; padding: 10px; }
    .ct-img { flex-basis: 74px; width: 74px; }
    .ct-name { font-size: 14px; }
    .ct-qty button { width: 36px; height: 36px; }
    .ct-remove { width: 34px; height: 34px; }
    .ct-sub { font-size: 16px; }
    .ct-summary { padding: 14px; }

    /* Checkout button + total neeche fixed bar me */
    .ct-checkout-desktop { display: none; }
    .ct-total-desktop { display: none; }
    .ct-bar {
      display: flex; align-items: center; gap: 12px;
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 1000;
      background: #fff; padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
      box-shadow: 0 -4px 16px rgba(0,0,0,0.12);
    }
    .ct-bar-total { line-height: 1.15; }
    .ct-bar-total small { display: block; font-size: 10px; font-weight: 700; color: #888; }
    .ct-bar-total strong { font-size: 19px; font-weight: 800; color: #f57c00; }
    .ct-bar .ct-checkout { flex: 1; height: 48px; }
  }
`;

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();

  // ===== Not Logged In =====
  if (!user) {
    return (
      <div className="ct-state">
        <style>{css}</style>
        <div className="ct-state-icon"><FaShoppingBag /></div>
        <h2>Please Login</h2>
        <p>Login to view your cart</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  // ===== Loading =====
  if (loading) {
    return (
      <div className="ct-state">
        <style>{css}</style>
        <p style={{ color: '#1a237e', fontWeight: 700, margin: 0 }}>Loading cart...</p>
      </div>
    );
  }

  const items = (cart?.items || []).filter((item) => item && item.book);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = totalPrice > FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const grandTotal = totalPrice + shipping;
  const remaining = Math.max(0, Math.ceil(FREE_SHIPPING_MIN + 1 - totalPrice));
  const progress = Math.min(100, (totalPrice / (FREE_SHIPPING_MIN + 1)) * 100);

  // ===== Empty Cart =====
  if (items.length === 0) {
    return (
      <div className="ct-state">
        <style>{css}</style>
        <div className="ct-state-icon"><FaShoppingBag /></div>
        <h2>Your Cart is Empty</h2>
        <p>Add some books to get started</p>
        <Link to="/shop">Browse Books</Link>
      </div>
    );
  }

  return (
    <div className="ct-page">
      <style>{css}</style>

      <h1 className="ct-title">
        Shopping Cart <span>({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
      </h1>

      <div className="ct-layout">
        {/* ===== Cart Items ===== */}
        <div className="ct-list">
          {items.map((item) => {
            const book = item.book;
            const bookLink = `/book/${book.slug || book._id}`;
            const maxReached = typeof book.stock === 'number' && item.quantity >= book.stock;

            return (
              <div key={book._id} className="ct-card">
                {/* Left: image */}
                <Link to={bookLink} className="ct-img" aria-label={book.title}>
                  <img
                    src={book.image}
                    alt={book.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/160x213?text=Book';
                    }}
                  />
                </Link>

                {/* Right: details */}
                <div className="ct-info">
                  <div className="ct-top">
                    <div style={{ minWidth: 0 }}>
                      <Link to={bookLink} className="ct-name">{book.title}</Link>
                      <p className="ct-unit">₹{item.price} each</p>
                    </div>
                    <button
                      className="ct-remove"
                      onClick={() => removeFromCart(book._id)}
                      title="Remove from cart"
                      aria-label="Remove from cart"
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>

                  <div className="ct-bottom">
                    <div className="ct-qty">
                      <button
                        onClick={() => updateQuantity(book._id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(book._id, item.quantity + 1)}
                        disabled={maxReached}
                        aria-label="Increase quantity"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                    <span className="ct-sub">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== Summary ===== */}
        <aside className="ct-summary">
          <h3>Order Summary</h3>

          <div className="ct-row">
            <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
            <span>₹{totalPrice.toFixed(0)}</span>
          </div>
          <div className="ct-row">
            <span>Shipping</span>
            <span className={shipping === 0 ? 'ct-free' : ''}>
              {shipping === 0 ? 'FREE' : `₹${shipping}`}
            </span>
          </div>

          {/* Free shipping progress */}
          {shipping > 0 ? (
            <div className="ct-ship">
              <p className="ct-ship-text">
                <FaTruck /> Add ₹{remaining} more for FREE shipping
              </p>
              <div className="ct-bar-track">
                <div className="ct-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="ct-ship done">
              <p className="ct-ship-text"><FaTruck /> You've got FREE shipping!</p>
            </div>
          )}

          <div className="ct-total ct-total-desktop">
            <span>Total</span>
            <span>₹{grandTotal.toFixed(0)}</span>
          </div>

          <button className="ct-checkout ct-checkout-desktop" onClick={() => navigate('/checkout')}>
            Proceed to Checkout <FaArrowRight size={12} />
          </button>

          <Link to="/shop" className="ct-continue">← Continue Shopping</Link>
        </aside>
      </div>

      {/* Mobile bottom bar */}
      <div className="ct-bar">
        <div className="ct-bar-total">
          <small>Total</small>
          <strong>₹{grandTotal.toFixed(0)}</strong>
        </div>
        <button className="ct-checkout" onClick={() => navigate('/checkout')}>
          Checkout <FaArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default Cart;