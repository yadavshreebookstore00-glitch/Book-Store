import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeart,
  FaShoppingCart,
  FaStar,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const css = `
  .wl-page { padding: 18px 20px 48px; max-width: 1100px; margin: 0 auto; box-sizing: border-box; }

  /* ===== Header ===== */
  .wl-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
  .wl-header-icon { width: 42px; height: 42px; border-radius: 12px; background: #fff3e0; color: #f57c00; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .wl-header-text { flex: 1; min-width: 0; }
  .wl-title { color: #1a237e; font-weight: 800; font-size: 22px; line-height: 1.15; margin: 0; }
  .wl-sub { color: #777; font-weight: 500; font-size: 13px; margin: 2px 0 0; }
  .wl-all { background: #fff; color: #1a237e; border: 2px solid #1a237e; height: 40px; padding: 0 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-family: inherit; transition: background 0.2s, color 0.2s; }
  .wl-all:hover:not(:disabled) { background: #1a237e; color: #fff; }
  .wl-all:disabled { opacity: 0.5; cursor: not-allowed; }

  .wl-error { background: #ffebee; color: #c62828; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; font-weight: 600; font-size: 13px; }

  /* ===== Grid ===== */
  .wl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 14px; }

  /* ===== Card: left image | right details ===== */
  .wl-card { display: flex; gap: 16px; background: #fff; padding: 14px; border-radius: 14px; border: 1px solid #ececf3; min-width: 0; transition: border-color 0.2s, box-shadow 0.2s; }
  .wl-card:hover { border-color: #c5cae9; box-shadow: 0 8px 22px rgba(26, 35, 126, 0.09); }

  /* Book-jaisa image: left spine + soft shadow */
  .wl-img { position: relative; flex: 0 0 96px; width: 96px; aspect-ratio: 3 / 4; align-self: flex-start; display: block; overflow: hidden; border-radius: 4px 9px 9px 4px; background: #f1f2f8; box-shadow: 3px 5px 12px rgba(26, 35, 126, 0.2); }
  .wl-img::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: linear-gradient(90deg, rgba(0,0,0,0.22), rgba(255,255,255,0.18) 65%, transparent); z-index: 1; pointer-events: none; }
  .wl-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .wl-off { position: absolute; left: 0; right: 0; bottom: 0; background: #f57c00; color: #fff; font-size: 10px; font-weight: 800; text-align: center; padding: 3px 0; letter-spacing: 0.4px; z-index: 2; }
  .wl-sold { position: absolute; inset: 0; background: rgba(255,255,255,0.78); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #c62828; z-index: 2; }

  .wl-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }

  .wl-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; min-height: 28px; }
  .wl-cat { background: #e8eaf6; color: #1a237e; padding: 2px 10px; border-radius: 20px; font-size: 10.5px; font-weight: 800; letter-spacing: 0.3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%; }
  .wl-heart { margin-left: auto; width: 28px; height: 28px; border-radius: 50%; border: none; background: #ffebee; color: #e53935; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px; flex-shrink: 0; transition: transform 0.15s; }
  .wl-heart:hover { transform: scale(1.12); }

  .wl-link { text-decoration: none; color: inherit; display: block; }
  .wl-name { font-size: 15px; font-weight: 800; color: #1a237e; margin: 0 0 2px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
  .wl-author { font-size: 12.5px; color: #666; font-weight: 500; margin: 0 0 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .wl-rate-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
  .wl-rating { background: #fff8e1; color: #8a5a00; font-size: 11.5px; font-weight: 800; padding: 2px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; }
  .wl-rating svg { color: #f57c00; font-size: 10px; }
  .wl-low { font-size: 11.5px; font-weight: 700; color: #e65100; }

  .wl-bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; margin-top: auto; }
  .wl-price-box { min-width: 0; }
  .wl-price-line { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
  .wl-price { font-size: 20px; font-weight: 800; color: #f57c00; line-height: 1; }
  .wl-old { font-size: 12px; color: #999; text-decoration: line-through; font-weight: 500; }
  .wl-save { font-size: 11px; font-weight: 800; color: #2e7d32; margin-top: 3px; }

  .wl-add { background: #1a237e; color: #fff; border: none; height: 38px; padding: 0 16px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-family: inherit; flex-shrink: 0; transition: background 0.2s; white-space: nowrap; }
  .wl-add:hover:not(:disabled) { background: #3949ab; }
  .wl-add:disabled { background: #cfd0d8; color: #fff; cursor: not-allowed; }

  /* ===== Empty / login ===== */
  .wl-state { padding: 70px 20px; text-align: center; max-width: 420px; margin: 0 auto; }
  .wl-state-icon { width: 84px; height: 84px; border-radius: 50%; background: #fff3e0; color: #f57c00; display: flex; align-items: center; justify-content: center; font-size: 34px; margin: 0 auto 18px; }
  .wl-state h2 { color: #1a237e; margin: 0 0 8px; font-weight: 800; font-size: 20px; }
  .wl-state p { color: #666; margin: 0 0 22px; font-weight: 500; font-size: 14px; }
  .wl-state a { background: #1a237e; color: #fff; padding: 11px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; }

  /* ===== Skeleton ===== */
  .wl-skel { display: flex; gap: 16px; background: #fff; padding: 14px; border-radius: 14px; border: 1px solid #ececf3; }
  .wl-skel-img { flex: 0 0 96px; aspect-ratio: 3 / 4; border-radius: 4px 9px 9px 4px; }
  .wl-skel-lines { flex: 1; display: flex; flex-direction: column; gap: 9px; padding-top: 4px; }
  .wl-shim { background: linear-gradient(90deg, #ececf3 0%, #f7f7fb 40%, #ececf3 80%); background-size: 800px 100%; animation: wlShimmer 1.4s infinite linear; border-radius: 6px; }
  @keyframes wlShimmer { 0% { background-position: -800px 0; } 100% { background-position: 800px 0; } }

  /* ===== Toast ===== */
  .wl-toast { position: fixed; top: 80px; right: 20px; padding: 11px 18px; border-radius: 10px; font-weight: 700; font-size: 13px; z-index: 1100; display: flex; align-items: center; gap: 8px; color: #fff; box-shadow: 0 8px 22px rgba(0,0,0,0.15); }
  .wl-toast-success { background: #2e7d32; }
  .wl-toast-error { background: #c62828; }

  /* ===== Tablet / mobile ===== */
  @media (max-width: 860px) {
    .wl-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  }

  @media (max-width: 480px) {
    .wl-page { padding: 14px 12px 36px; }
    .wl-header { gap: 10px; margin-bottom: 14px; }
    .wl-header-icon { width: 38px; height: 38px; font-size: 16px; border-radius: 10px; }
    .wl-title { font-size: 19px; }
    .wl-sub { font-size: 12px; }
    .wl-all { width: 100%; justify-content: center; height: 42px; }

    .wl-card { gap: 12px; padding: 12px; border-radius: 12px; }
    .wl-img, .wl-skel-img { flex-basis: 84px; width: 84px; }
    .wl-name { font-size: 14px; }
    .wl-rate-row { margin-bottom: 8px; }
    .wl-price { font-size: 18px; }
    .wl-add { height: 40px; padding: 0 14px; }
    .wl-heart { width: 30px; height: 30px; }
    .wl-toast { top: 64px; left: 12px; right: 12px; justify-content: center; }
  }
`;

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    wishlist,
    loading: wishlistLoading,
    error,
    toggleWishlist,
  } = useWishlist();
  const { addToCart } = useCart();

  const [addingId, setAddingId] = useState(null);
  const [addingAll, setAddingAll] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
  };

  const isOut = (book) => typeof book.stock === 'number' && book.stock <= 0;

  const handleAddToCart = async (bookId) => {
    setAddingId(bookId);
    const result = await addToCart(bookId, 1);
    setAddingId(null);
    if (result?.success) showToast('Added to cart!', 'success');
    else showToast(result?.message || 'Could not add to cart', 'error');
  };

  const handleRemove = async (bookId) => {
    const result = await toggleWishlist(bookId);
    if (result?.success) showToast('Removed from wishlist', 'success');
  };

  // Ek ek karke add (sequential), taaki cart API par race na ho
  const handleAddAll = async (books) => {
    const available = books.filter((b) => !isOut(b));
    if (available.length === 0) return;
    setAddingAll(true);
    let added = 0;
    for (const b of available) {
      const result = await addToCart(b._id, 1);
      if (result?.success) added += 1;
    }
    setAddingAll(false);
    if (added === 0) showToast('Could not add books to cart', 'error');
    else showToast(`${added} book${added > 1 ? 's' : ''} added to cart!`, 'success');
  };

  // ===== Auth loading =====
  if (authLoading) {
    return (
      <div className="wl-state">
        <style>{css}</style>
        <p style={{ color: '#1a237e', fontWeight: 700, margin: 0 }}>Loading...</p>
      </div>
    );
  }

  // ===== Not logged in =====
  if (!user) {
    return (
      <div className="wl-state">
        <style>{css}</style>
        <div className="wl-state-icon"><FaHeart /></div>
        <h2>Please Login</h2>
        <p>Login to view your wishlist</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  // ===== Wishlist loading =====
  if (wishlistLoading) {
    return (
      <div className="wl-page">
        <style>{css}</style>
        <div className="wl-header">
          <div className="wl-header-icon"><FaHeart /></div>
          <div className="wl-header-text">
            <h1 className="wl-title">My Wishlist</h1>
          </div>
        </div>
        <div className="wl-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="wl-skel">
              <div className="wl-skel-img wl-shim" />
              <div className="wl-skel-lines">
                <div className="wl-shim" style={{ height: 14, width: '30%' }} />
                <div className="wl-shim" style={{ height: 16, width: '80%' }} />
                <div className="wl-shim" style={{ height: 12, width: '50%' }} />
                <div className="wl-shim" style={{ height: 38, width: '100%', marginTop: 'auto' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== Empty wishlist =====
  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="wl-state">
        <style>{css}</style>
        <div className="wl-state-icon"><FaHeart /></div>
        <h2>Your Wishlist is Empty</h2>
        <p>Tap the heart on any book to save it here.</p>
        <Link to="/shop">Browse Books</Link>
      </div>
    );
  }

  const validBooks = wishlist.filter((book) => book && book._id);
  const availableCount = validBooks.filter((b) => !isOut(b)).length;

  // ===== Wishlist items =====
  return (
    <div className="wl-page">
      <style>{css}</style>

      {toast && (
        <div className={`wl-toast wl-toast-${toastType}`}>
          {toastType === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="wl-header">
        <div className="wl-header-icon"><FaHeart /></div>
        <div className="wl-header-text">
          <h1 className="wl-title">My Wishlist</h1>
          <p className="wl-sub">{validBooks.length} saved book{validBooks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          className="wl-all"
          onClick={() => handleAddAll(validBooks)}
          disabled={addingAll || availableCount === 0}
        >
          <FaShoppingCart size={13} />
          {addingAll ? 'Adding...' : 'Add all to cart'}
        </button>
      </div>

      {error && <div className="wl-error">⚠️ {error}</div>}

      <div className="wl-grid">
        {validBooks.map((book) => {
          const outOfStock = isOut(book);
          const lowStock = typeof book.stock === 'number' && book.stock > 0 && book.stock <= 5;
          const hasDiscount = book.originalPrice > book.price;
          const discountPercent = hasDiscount
            ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
            : 0;
          const bookLink = `/book/${book.slug || book._id}`;

          return (
            <div key={book._id} className="wl-card">
              {/* Left: image */}
              <Link to={bookLink} className="wl-img" aria-label={book.title}>
                <img
                  src={book.image}
                  alt={book.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/180x240?text=Book';
                  }}
                />
                {hasDiscount && !outOfStock && <span className="wl-off">{discountPercent}% OFF</span>}
                {outOfStock && <span className="wl-sold">Sold out</span>}
              </Link>

              {/* Right: details */}
              <div className="wl-info">
                <div className="wl-top">
                  {book.category ? <span className="wl-cat">{book.category}</span> : <span />}
                  <button
                    className="wl-heart"
                    onClick={() => handleRemove(book._id)}
                    title="Remove from wishlist"
                    aria-label="Remove from wishlist"
                  >
                    <FaHeart />
                  </button>
                </div>

                <Link to={bookLink} className="wl-link">
                  <h3 className="wl-name">{book.title}</h3>
                  <p className="wl-author">{book.author}</p>
                </Link>

                <div className="wl-rate-row">
                  <span className="wl-rating">
                    <FaStar /> {Number(book.rating || 0).toFixed(1)}
                  </span>
                  {lowStock && <span className="wl-low">Only {book.stock} left</span>}
                </div>

                <div className="wl-bottom">
                  <div className="wl-price-box">
                    <div className="wl-price-line">
                      <span className="wl-price">₹{book.price}</span>
                      {hasDiscount && <span className="wl-old">₹{book.originalPrice}</span>}
                    </div>
                    {hasDiscount && (
                      <div className="wl-save">Save ₹{book.originalPrice - book.price}</div>
                    )}
                  </div>

                  <button
                    className="wl-add"
                    onClick={() => handleAddToCart(book._id)}
                    disabled={outOfStock || addingId === book._id || addingAll}
                  >
                    <FaShoppingCart size={12} />
                    {outOfStock ? 'Sold out' : addingId === book._id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;