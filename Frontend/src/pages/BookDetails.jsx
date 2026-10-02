import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaBolt,
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaMinus,
  FaPlus,
  FaChevronRight,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [addingToCart, setAddingToCart] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Fetch book
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/books/${id}`);
        setBook(data.book);
        setRelated(data.related || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Book not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  // Reset on book change
  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    setShowFullDesc(false);
  }, [id]);

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
  };

  // ===== Add to Cart =====
  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    const result = await addToCart(book._id, quantity);
    setAddingToCart(false);
    if (result.success) {
      showToast('Added to cart!', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  // ===== Wishlist Toggle =====
  const handleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const result = await toggleWishlist(book._id);
    if (result.success) {
      showToast(result.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist', 'success');
    }
  };

  // ===== Buy Now =====
  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout', {
      state: {
        buyNow: true,
        item: {
          book: book._id,
          title: book.title,
          image: book.image,
          price: book.price,
          quantity,
        },
      },
    });
  };

  // ===== Render Stars =====
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`full-${i}`} />);
    if (hasHalf) stars.push(<FaStarHalfAlt key="half" />);
    while (stars.length < 5) stars.push(<FaRegStar key={`empty-${stars.length}`} />);
    return stars;
  };

  if (loading) return <Loader type="details" />;

  if (error || !book) {
    return (
      <div className="bd-notfound">
        <style>{css}</style>
        <h1>404</h1>
        <h2>Book Not Found</h2>
        <p>{error || 'The book you are looking for does not exist.'}</p>
        <Link to="/shop" className="bd-back">Back to Shop</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(book._id);
  const hasDiscount = book.originalPrice > book.price;
  const discountPercent = hasDiscount
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;
  const inStock = book.stock > 0;
  const longDesc = (book.description || '').length > 180;

  return (
    <div className="bd-page">
      <style>{css}</style>

      {/* ===== Toast ===== */}
      {toast && (
        <div className={`bd-toast bd-toast-${toastType}`}>
          {toastType === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{toast}</span>
        </div>
      )}

      {/* ===== Breadcrumb ===== */}
      <nav className="bd-crumb">
        <Link to="/">Home</Link>
        <FaChevronRight className="bd-crumb-sep" />
        <Link to="/shop">Shop</Link>
        <FaChevronRight className="bd-crumb-sep" />
        <span className="bd-crumb-current">{book.title}</span>
      </nav>

      {/* ===== Main Card ===== */}
      <div className="bd-card">
        {/* Image */}
        <div className="bd-image">
          <img
            src={book.image}
            alt={book.title}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x550?text=Book';
            }}
          />
        </div>

        <div className="bd-info">
          {/* Head: category, title, author, rating, price */}
          <div className="bd-head">
            <div className="bd-head-top">
              <span className="bd-cat">{book.category}</span>
              <button
                className={`bd-wish ${inWishlist ? 'active' : ''}`}
                onClick={handleWishlist}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {inWishlist ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            <h1 className="bd-title">{book.title}</h1>
            <p className="bd-author">by <strong>{book.author}</strong></p>

            <div className="bd-rating">
              <span className="bd-stars">{renderStars(book.rating)}</span>
              <span className="bd-rating-val">{book.rating?.toFixed(1) || '0.0'}</span>
              <span className="bd-rating-count">({book.numReviews || 0})</span>
            </div>

            <div className="bd-price">
              <span className="bd-price-now">₹{book.price}</span>
              {hasDiscount && <span className="bd-price-old">₹{book.originalPrice}</span>}
              {hasDiscount && <span className="bd-price-off">{discountPercent}% off</span>}
            </div>
          </div>

          {/* Rest */}
          <div className="bd-rest">
            {/* Stock + meta chips */}
            <div className="bd-chips">
              <span className={`bd-stock ${book.stock > 10 ? 'in' : inStock ? 'low' : 'out'}`}>
                {book.stock > 10
                  ? 'In stock'
                  : inStock
                    ? `Only ${book.stock} left`
                    : 'Out of stock'}
              </span>
              {book.language && <span className="bd-chip"><b>Language</b> {book.language}</span>}
              {book.pages > 0 && <span className="bd-chip"><b>Pages</b> {book.pages}</span>}
              {book.publisher && <span className="bd-chip"><b>Publisher</b> {book.publisher}</span>}
            </div>

            {/* Description */}
            {book.description && (
              <div className="bd-desc-wrap">
                <p className={`bd-desc ${showFullDesc ? '' : 'clamped'}`}>{book.description}</p>
                {longDesc && (
                  <button className="bd-more" onClick={() => setShowFullDesc((v) => !v)}>
                    {showFullDesc ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Quantity + Actions */}
            {inStock && (
              <>
                <div className="bd-qty-row">
                  <span className="bd-qty-label">Quantity</span>
                  <div className="bd-qty">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                      <FaMinus />
                    </button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))} aria-label="Increase quantity">
                      <FaPlus />
                    </button>
                  </div>
                </div>

                {/* Mobile par ye bottom bar ban jaata hai */}
                <div className="bd-actions">
                  <div className="bd-bar-total">
                    <small>Total</small>
                    <strong>₹{book.price * quantity}</strong>
                  </div>
                  <button className="bd-btn bd-btn-primary" onClick={handleAddToCart} disabled={addingToCart}>
                    <FaShoppingCart />
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button className="bd-btn bd-btn-accent" onClick={handleBuyNow}>
                    <FaBolt />
                    Buy Now
                  </button>
                </div>
              </>
            )}

            {/* Trust */}
            <div className="bd-trust">
              <span><FaTruck /> Free delivery</span>
              <span><FaUndo /> 7-day returns</span>
              <span><FaShieldAlt /> Secure pay</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Related Books ===== */}
      {related.length > 0 && (
        <section className="bd-related">
          <div className="bd-related-head">
            <h2>You may also like</h2>
            <Link to="/shop">View all</Link>
          </div>

          <div className="bd-related-grid">
            {related.map((b) => (
              <Link key={b._id} to={`/book/${b.slug || b._id}`} className="bd-rcard">
                <div className="bd-rimg">
                  <img
                    src={b.image}
                    alt={b.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x260?text=Book';
                    }}
                  />
                </div>
                <div className="bd-rinfo">
                  <h3>{b.title}</h3>
                  <p>{b.author}</p>
                  <div className="bd-rbottom">
                    <span className="bd-rprice">₹{b.price}</span>
                    <span className="bd-rrating"><FaStar /> {b.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const css = `
  .bd-page { padding: 14px 20px 48px; max-width: 1100px; margin: 0 auto; width: 100%; box-sizing: border-box; }

  /* Not found */
  .bd-notfound { padding: 70px 20px; text-align: center; max-width: 480px; margin: 0 auto; }
  .bd-notfound h1 { font-size: 64px; color: #1a237e; margin: 0; font-weight: 800; }
  .bd-notfound h2 { color: #333; margin: 0 0 8px; font-weight: 700; font-size: 20px; }
  .bd-notfound p { color: #666; margin: 0 0 22px; font-weight: 500; font-size: 14px; }
  .bd-back { background: #1a237e; color: #fff; padding: 11px 26px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; }

  /* Toast */
  .bd-toast { position: fixed; top: 80px; right: 20px; padding: 11px 18px; border-radius: 10px; font-weight: 700; font-size: 13px; z-index: 1100; display: flex; align-items: center; gap: 8px; color: #fff; box-shadow: 0 8px 22px rgba(0,0,0,0.15); animation: bdToastIn 0.25s ease; }
  .bd-toast-success { background: #2e7d32; }
  .bd-toast-error { background: #c62828; }
  @keyframes bdToastIn { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* Breadcrumb */
  .bd-crumb { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #999; white-space: nowrap; overflow: hidden; }
  .bd-crumb a { color: #666; text-decoration: none; flex-shrink: 0; }
  .bd-crumb a:hover { color: #1a237e; }
  .bd-crumb-sep { font-size: 8px; color: #ccc; flex-shrink: 0; }
  .bd-crumb-current { color: #1a237e; font-weight: 700; overflow: hidden; text-overflow: ellipsis; min-width: 0; }

  /* Main card */
  .bd-card { display: grid; grid-template-columns: 270px minmax(0, 1fr); gap: 26px; background: #fff; padding: 22px; border-radius: 14px; border: 1px solid #eee; box-shadow: 0 2px 12px rgba(26,35,126,0.05); }

  .bd-image { background: #f7f7f9; border-radius: 10px; padding: 14px; display: flex; align-items: center; justify-content: center; aspect-ratio: 3 / 4; align-self: start; }
  .bd-image img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px; box-shadow: 0 6px 16px rgba(0,0,0,0.12); }

  .bd-info { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  .bd-head { min-width: 0; }
  .bd-rest { display: flex; flex-direction: column; gap: 14px; min-width: 0; }

  .bd-head-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
  .bd-cat { background: #e8eaf6; color: #1a237e; padding: 3px 11px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 0.4px; }
  .bd-wish { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #ddd; background: #fff; color: #1a237e; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; flex-shrink: 0; }
  .bd-wish.active { background: #ffebee; color: #c62828; border-color: #c62828; }

  .bd-title { color: #1a237e; font-weight: 800; font-size: 24px; line-height: 1.25; margin: 0 0 4px; word-break: break-word; }
  .bd-author { color: #666; font-weight: 500; font-size: 13px; margin: 0 0 8px; }
  .bd-author strong { color: #1a237e; font-weight: 700; }

  .bd-rating { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
  .bd-stars { display: inline-flex; gap: 2px; color: #f57c00; font-size: 13px; }
  .bd-rating-val { font-weight: 800; color: #1a237e; font-size: 13px; }
  .bd-rating-count { color: #999; font-size: 12px; font-weight: 600; }

  .bd-price { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .bd-price-now { font-size: 26px; font-weight: 800; color: #f57c00; line-height: 1; }
  .bd-price-old { font-size: 14px; color: #999; text-decoration: line-through; font-weight: 500; }
  .bd-price-off { font-size: 12px; font-weight: 800; color: #2e7d32; }

  /* Chips */
  .bd-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .bd-stock { padding: 4px 11px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .bd-stock.in { background: #e8f5e9; color: #2e7d32; }
  .bd-stock.low { background: #fff3e0; color: #e65100; }
  .bd-stock.out { background: #ffebee; color: #c62828; }
  .bd-chip { padding: 4px 11px; border-radius: 20px; background: #f5f5f7; color: #333; font-size: 12px; font-weight: 600; }
  .bd-chip b { color: #999; font-weight: 700; margin-right: 3px; }

  /* Description */
  .bd-desc-wrap { border-top: 1px solid #f0f0f0; padding-top: 12px; }
  .bd-desc { color: #555; font-weight: 500; line-height: 1.65; font-size: 14px; margin: 0; }
  .bd-desc.clamped { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
  .bd-more { background: none; border: none; color: #1a237e; font-weight: 700; font-size: 13px; padding: 6px 0 0; cursor: pointer; font-family: inherit; }

  /* Quantity */
  .bd-qty-row { display: flex; align-items: center; gap: 12px; }
  .bd-qty-label { font-weight: 700; color: #1a237e; font-size: 13px; }
  .bd-qty { display: inline-flex; align-items: center; border: 1.5px solid #e0e0e0; border-radius: 8px; overflow: hidden; background: #fff; }
  .bd-qty button { background: #f7f7f9; border: none; width: 34px; height: 34px; cursor: pointer; color: #1a237e; font-size: 11px; display: flex; align-items: center; justify-content: center; }
  .bd-qty span { min-width: 40px; text-align: center; font-weight: 800; font-size: 14px; color: #1a237e; }

  /* Actions */
  .bd-actions { display: flex; gap: 10px; }
  .bd-bar-total { display: none; }
  .bd-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; padding: 12px 18px; min-height: 46px; transition: background 0.2s; }
  .bd-btn-primary { background: #1a237e; color: #fff; }
  .bd-btn-primary:hover:not(:disabled) { background: #3949ab; }
  .bd-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .bd-btn-accent { background: #f57c00; color: #fff; }
  .bd-btn-accent:hover { background: #ef6c00; }

  /* Trust */
  .bd-trust { display: flex; flex-wrap: wrap; gap: 6px 16px; padding-top: 12px; border-top: 1px solid #f0f0f0; font-size: 12px; font-weight: 600; color: #666; }
  .bd-trust span { display: inline-flex; align-items: center; gap: 6px; }
  .bd-trust svg { color: #f57c00; font-size: 13px; }

  /* Related */
  .bd-related { margin-top: 32px; }
  .bd-related-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .bd-related-head h2 { color: #1a237e; font-weight: 800; font-size: 20px; margin: 0; }
  .bd-related-head a { color: #f57c00; font-weight: 700; font-size: 13px; text-decoration: none; }
  .bd-related-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  .bd-rcard { text-decoration: none; color: inherit; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee; transition: box-shadow 0.2s; }
  .bd-rcard:hover { box-shadow: 0 8px 22px rgba(26,35,126,0.12); }
  .bd-rimg { width: 100%; aspect-ratio: 3 / 4; background: #f5f5f5; overflow: hidden; }
  .bd-rimg img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .bd-rinfo { padding: 10px 12px 12px; }
  .bd-rinfo h3 { font-size: 13px; font-weight: 700; color: #1a237e; margin: 0 0 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bd-rinfo p { font-size: 11px; color: #666; font-weight: 500; margin: 0 0 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bd-rbottom { display: flex; justify-content: space-between; align-items: center; }
  .bd-rprice { font-size: 14px; font-weight: 800; color: #f57c00; }
  .bd-rrating { font-size: 11px; color: #666; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
  .bd-rrating svg { color: #f57c00; font-size: 10px; }

  /* ============ Tablet ============ */
  @media (max-width: 900px) {
    .bd-card { grid-template-columns: 220px minmax(0, 1fr); gap: 20px; padding: 18px; }
    .bd-title { font-size: 21px; }
    .bd-related-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  /* ============ Mobile ============ */
  @media (max-width: 640px) {
    .bd-page { padding: 10px 12px 96px; }
    .bd-toast { top: 64px; left: 12px; right: 12px; justify-content: center; }
    .bd-crumb { margin-bottom: 10px; font-size: 11.5px; }

    /* Compact header: chhoti image left me, title/price right me */
    .bd-card { grid-template-columns: 108px minmax(0, 1fr); gap: 10px 14px; padding: 14px; border-radius: 12px; box-shadow: none; }
    .bd-info { display: contents; }
    .bd-image { padding: 6px; border-radius: 8px; }
    .bd-image img { box-shadow: 0 3px 8px rgba(0,0,0,0.12); }
    .bd-head { align-self: start; }
    .bd-head-top { margin-bottom: 6px; }
    .bd-cat { font-size: 10px; padding: 2px 9px; }
    .bd-wish { width: 30px; height: 30px; font-size: 13px; }
    .bd-title { font-size: 16px; }
    .bd-author { font-size: 12px; margin-bottom: 6px; }
    .bd-rating { margin-bottom: 8px; }
    .bd-price-now { font-size: 21px; }
    .bd-price-old { font-size: 13px; }
    .bd-price-off { font-size: 11px; }

    .bd-rest { grid-column: 1 / -1; gap: 12px; }
    .bd-desc { font-size: 13px; line-height: 1.6; }
    .bd-desc.clamped { -webkit-line-clamp: 3; }

    /* Sticky bottom bar */
    .bd-actions {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 1000;
      background: #fff; align-items: center; gap: 8px;
      padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
      box-shadow: 0 -4px 16px rgba(0,0,0,0.12);
    }
    .bd-bar-total { display: block; line-height: 1.15; padding-right: 2px; }
    .bd-bar-total small { display: block; font-size: 10px; font-weight: 700; color: #888; }
    .bd-bar-total strong { font-size: 17px; font-weight: 800; color: #f57c00; }
    .bd-btn { padding: 11px 8px; font-size: 13px; }

    .bd-qty button { width: 38px; height: 38px; }

    .bd-related { margin-top: 24px; }
    .bd-related-head h2 { font-size: 17px; }
    /* Related books: ek line me swipe karne wali list */
    .bd-related-grid { display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; margin: 0 -12px; padding: 0 12px 6px; scrollbar-width: none; }
    .bd-related-grid::-webkit-scrollbar { display: none; }
    .bd-rcard { flex: 0 0 132px; scroll-snap-align: start; }
    .bd-rinfo { padding: 8px 10px 10px; }
    .bd-rinfo h3 { font-size: 12px; }
  }
`;

export default BookDetails;