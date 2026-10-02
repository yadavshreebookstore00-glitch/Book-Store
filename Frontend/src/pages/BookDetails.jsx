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

  // Fetch book
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
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

  // Scroll to top on book change
  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
  }, [id]);

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

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
      showToast(
        result.action === 'added'
          ? 'Added to wishlist!'
          : 'Removed from wishlist',
        'success'
      );
    }
  };

  // ===== Buy Now =====
  const handleBuyNow = async () => {
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

  // ===== Show Toast =====
  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
  };

  // ===== Render Stars =====
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} />);
    }
    if (hasHalf) {
      stars.push(<FaStarHalfAlt key="half" />);
    }
    while (stars.length < 5) {
      stars.push(<FaRegStar key={`empty-${stars.length}`} />);
    }
    return stars;
  };

  if (loading) return <Loader type="details" />;

  if (error || !book) {
    return (
      <div className="not-found">
        <h1>404</h1>
        <h2>Book Not Found</h2>
        <p>{error || 'The book you are looking for does not exist.'}</p>
        <Link to="/shop" className="back-btn">
          Back to Shop
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(book._id);
  const discountPercent =
    book.originalPrice > book.price
      ? Math.round(
          ((book.originalPrice - book.price) / book.originalPrice) * 100
        )
      : 0;

  return (
    <div className="book-details-page">
      {/* ===== Toast ===== */}
      {toast && (
        <div className={`toast toast-${toastType}`}>
          {toastType === 'success' ? (
            <FaCheckCircle />
          ) : (
            <FaExclamationTriangle />
          )}
          <span>{toast}</span>
        </div>
      )}

      {/* ===== Breadcrumb ===== */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <FaChevronRight className="breadcrumb-sep" />
        <Link to="/shop">Shop</Link>
        <FaChevronRight className="breadcrumb-sep" />
        <span className="breadcrumb-current">{book.title}</span>
      </div>

      {/* ===== Main Layout ===== */}
      <div className="details-layout">
        {/* ===== LEFT: Image ===== */}
        <div className="image-section">
          <div className="image-wrapper">
            <img
              src={book.image}
              alt={book.title}
              onError={(e) => {
                e.target.src =
                  'https://via.placeholder.com/400x550?text=Book';
              }}
            />

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <span className="discount-badge">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Trust Badges */}
          <div className="trust-badges">
            <div className="trust-item">
              <FaTruck />
              <span>Free Delivery</span>
            </div>
            <div className="trust-item">
              <FaUndo />
              <span>7-Day Returns</span>
            </div>
            <div className="trust-item">
              <FaShieldAlt />
              <span>Secure Pay</span>
            </div>
          </div>
        </div>

        {/* ===== RIGHT: Info ===== */}
        <div className="info-section">
          {/* Category */}
          <span className="category-tag">{book.category}</span>

          {/* Title */}
          <h1 className="book-title">{book.title}</h1>

          {/* Author */}
          <p className="book-author">
            by <strong>{book.author}</strong>
          </p>

          {/* Rating */}
          <div className="rating-row">
            <div className="stars">{renderStars(book.rating)}</div>
            <span className="rating-value">{book.rating?.toFixed(1)}</span>
            <span className="rating-count">
              ({book.numReviews || 0} reviews)
            </span>
          </div>

          {/* Description */}
          <p className="book-description">{book.description}</p>

          {/* Price Box */}
          <div className="price-box">
            <div className="price-main">
              <span className="price-current">₹{book.price}</span>
              {book.originalPrice > book.price && (
                <span className="price-original">
                  ₹{book.originalPrice}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="save-badge">
                Save ₹{book.originalPrice - book.price}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div
            className={`stock-status ${
              book.stock > 10
                ? 'in-stock'
                : book.stock > 0
                ? 'low-stock'
                : 'out-stock'
            }`}
          >
            {book.stock > 10
              ? `✓ In Stock (${book.stock} available)`
              : book.stock > 0
              ? `⚠ Only ${book.stock} left in stock`
              : '✕ Out of Stock'}
          </div>

          {/* Quantity + Actions */}
          {book.stock > 0 && (
            <>
              {/* Quantity */}
              <div className="quantity-row">
                <span className="qty-label">Quantity:</span>
                <div className="qty-selector">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    <FaMinus />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(book.stock, q + 1))
                    }
                    aria-label="Increase quantity"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="btn btn-primary"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  <FaShoppingCart />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                <button className="btn btn-accent" onClick={handleBuyNow}>
                  <FaBolt />
                  Buy Now
                </button>

                <button
                  className={`btn btn-wishlist ${
                    inWishlist ? 'active' : ''
                  }`}
                  onClick={handleWishlist}
                  aria-label={
                    inWishlist ? 'Remove from wishlist' : 'Add to wishlist'
                  }
                >
                  {inWishlist ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
            </>
          )}

          {/* Book Details Grid */}
          <div className="book-meta">
            {book.language && (
              <div className="meta-item">
                <span className="meta-label">Language</span>
                <span className="meta-value">{book.language}</span>
              </div>
            )}
            {book.pages > 0 && (
              <div className="meta-item">
                <span className="meta-label">Pages</span>
                <span className="meta-value">{book.pages}</span>
              </div>
            )}
            {book.publisher && (
              <div className="meta-item">
                <span className="meta-label">Publisher</span>
                <span className="meta-value">{book.publisher}</span>
              </div>
            )}
            {book.stock > 0 && (
              <div className="meta-item">
                <span className="meta-label">Availability</span>
                <span className="meta-value meta-success">In Stock</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Related Books ===== */}
      {related.length > 0 && (
        <div className="related-section">
          <div className="related-header">
            <h2 className="related-title">
              You May Also <span className="related-title-gradient">Like</span>
            </h2>
            <Link to="/shop" className="related-view-all">
              View All →
            </Link>
          </div>

          <div className="related-grid">
            {related.map((b) => (
              <Link
                key={b._id}
                to={`/book/${b.slug || b._id}`}
                className="related-card"
              >
                <div className="related-image-wrap">
                  <img
                    src={b.image}
                    alt={b.title}
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/200x260?text=Book';
                    }}
                  />
                </div>
                <div className="related-info">
                  <h3 className="related-book-title">{b.title}</h3>
                  <p className="related-author">{b.author}</p>
                  <div className="related-bottom">
                    <span className="related-price">₹{b.price}</span>
                    <span className="related-rating">
                      <FaStar /> {b.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================================
          CSS
          ========================================================== */}
      <style>{`
        /* ================= PAGE ================= */
        .book-details-page {
          padding: 20px 20px 60px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        /* ================= NOT FOUND ================= */
        .not-found {
          padding: 80px 20px;
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }

        .not-found h1 {
          font-size: 80px;
          color: #1a237e;
          margin: 0;
          font-weight: 800;
          letter-spacing: -2px;
        }

        .not-found h2 {
          color: #333;
          margin-bottom: 12px;
          font-weight: 700;
          font-size: 22px;
        }

        .not-found p {
          color: #666;
          margin-bottom: 28px;
          font-weight: 500;
          font-size: 14px;
        }

        .back-btn {
          background: #1a237e;
          color: #fff;
          padding: 12px 30px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          display: inline-block;
          transition: all 0.3s;
        }

        .back-btn:hover {
          background: #f57c00;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 124, 0, 0.3);
        }

        /* ================= TOAST ================= */
        .toast {
          position: fixed;
          top: 80px;
          right: 20px;
          padding: 14px 22px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: toastIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
          color: #fff;
        }

        .toast-success {
          background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);
        }

        .toast-error {
          background: linear-gradient(135deg, #c62828 0%, #e53935 100%);
        }

        @keyframes toastIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* ================= BREADCRUMB ================= */
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 12.5px;
          font-weight: 600;
          color: #999;
          flex-wrap: wrap;
        }

        .breadcrumb a {
          color: #666;
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb a:hover {
          color: #1a237e;
        }

        .breadcrumb-sep {
          font-size: 9px;
          color: #ccc;
        }

        .breadcrumb-current {
          color: #1a237e;
          font-weight: 700;
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ================= MAIN LAYOUT ================= */
        .details-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 40px;
          background: #fff;
          padding: 35px;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(26, 35, 126, 0.08);
          border: 1px solid #f0f0f0;
        }

        /* ================= IMAGE SECTION ================= */
        .image-section {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .image-wrapper {
          position: relative;
          background: #f9f9f9;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 480px;
          overflow: hidden;
        }

        .image-wrapper img {
          width: 100%;
          max-width: 320px;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          transition: transform 0.4s ease;
        }

        .image-wrapper:hover img {
          transform: scale(1.03);
        }

        .discount-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
          color: #fff;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.5px;
          box-shadow: 0 6px 16px rgba(245, 124, 0, 0.4);
        }

        /* Trust Badges */
        .trust-badges {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .trust-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 6px;
          background: #f9f9f9;
          border-radius: 10px;
          font-size: 10.5px;
          font-weight: 700;
          color: #555;
          text-align: center;
          border: 1px solid #f0f0f0;
        }

        .trust-item svg {
          color: #f57c00;
          font-size: 16px;
        }

        /* ================= INFO SECTION ================= */
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .category-tag {
          display: inline-block;
          align-self: flex-start;
          background: #e8eaf6;
          color: #1a237e;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .book-title {
          color: #1a237e;
          font-weight: 800;
          font-size: 28px;
          line-height: 1.25;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .book-author {
          color: #666;
          font-weight: 500;
          font-size: 14px;
          margin: 0;
        }

        .book-author strong {
          color: #1a237e;
          font-weight: 700;
        }

        /* Rating Row */
        .rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .stars {
          display: inline-flex;
          gap: 3px;
          color: #f57c00;
          font-size: 15px;
        }

        .rating-value {
          font-weight: 800;
          color: #1a237e;
          font-size: 14px;
        }

        .rating-count {
          color: #999;
          font-size: 12.5px;
          font-weight: 600;
        }

        /* Description */
        .book-description {
          color: #555;
          font-weight: 500;
          line-height: 1.75;
          font-size: 14px;
          margin: 0;
          padding: 16px 0;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
        }

        /* Price Box */
        .price-box {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .price-main {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }

        .price-current {
          font-size: 32px;
          font-weight: 800;
          color: #f57c00;
          letter-spacing: -1px;
          line-height: 1;
        }

        .price-original {
          font-size: 16px;
          color: #999;
          text-decoration: line-through;
          font-weight: 500;
        }

        .save-badge {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        /* Stock Status */
        .stock-status {
          font-size: 13px;
          font-weight: 700;
          padding: 10px 16px;
          border-radius: 10px;
          display: inline-block;
          align-self: flex-start;
        }

        .stock-status.in-stock {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .stock-status.low-stock {
          background: #fff3e0;
          color: #f57c00;
        }

        .stock-status.out-stock {
          background: #ffebee;
          color: #c62828;
        }

        /* Quantity Row */
        .quantity-row {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .qty-label {
          font-weight: 700;
          color: #1a237e;
          font-size: 14px;
        }

        .qty-selector {
          display: flex;
          align-items: center;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }

        .qty-selector button {
          background: #f9f9f9;
          border: none;
          width: 38px;
          height: 38px;
          cursor: pointer;
          color: #1a237e;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .qty-selector button:hover {
          background: #1a237e;
          color: #fff;
        }

        .qty-value {
          width: 48px;
          text-align: center;
          font-weight: 800;
          font-size: 15px;
          color: #1a237e;
          border-left: 1.5px solid #e0e0e0;
          border-right: 1.5px solid #e0e0e0;
          line-height: 38px;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          padding: 14px 22px;
          letter-spacing: 0.3px;
        }

        .btn-primary {
          flex: 1 1 180px;
          background: #1a237e;
          color: #fff;
          box-shadow: 0 6px 18px rgba(26, 35, 126, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          background: #3949ab;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(26, 35, 126, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-accent {
          flex: 1 1 160px;
          background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
          color: #fff;
          box-shadow: 0 6px 18px rgba(245, 124, 0, 0.35);
        }

        .btn-accent:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(245, 124, 0, 0.45);
        }

        .btn-wishlist {
          flex: 0 0 auto;
          padding: 14px 18px;
          background: #fff;
          color: #1a237e;
          border: 2px solid #1a237e;
        }

        .btn-wishlist:hover {
          background: #e8eaf6;
          transform: translateY(-2px);
        }

        .btn-wishlist.active {
          background: #ffebee;
          color: #c62828;
          border-color: #c62828;
        }

        /* Book Meta Grid */
        .book-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          padding-top: 16px;
          margin-top: 6px;
          border-top: 1px solid #f0f0f0;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-label {
          font-size: 10px;
          font-weight: 800;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .meta-value {
          font-size: 13.5px;
          font-weight: 700;
          color: #1a237e;
        }

        .meta-success {
          color: #2e7d32;
        }

        /* ================= RELATED SECTION ================= */
        .related-section {
          margin-top: 60px;
        }

        .related-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .related-title {
          color: #1a237e;
          font-weight: 800;
          font-size: 24px;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .related-title-gradient {
          background: linear-gradient(135deg, #f57c00 0%, #ff9800 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .related-view-all {
          color: #f57c00;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          border-bottom: 2px solid #f57c00;
          padding-bottom: 2px;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .related-card {
          text-decoration: none;
          color: inherit;
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #f0f0f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .related-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(26, 35, 126, 0.12);
          border-color: transparent;
        }

        .related-image-wrap {
          width: 100%;
          height: 240px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .related-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .related-card:hover .related-image-wrap img {
          transform: scale(1.08);
        }

        .related-info {
          padding: 12px 14px 14px;
        }

        .related-book-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #1a237e;
          margin: 0 0 3px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .related-author {
          font-size: 11px;
          color: #666;
          font-weight: 500;
          margin: 0 0 10px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .related-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .related-price {
          font-size: 15px;
          font-weight: 800;
          color: #f57c00;
        }

        .related-rating {
          font-size: 11px;
          color: #666;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .related-rating svg {
          color: #f57c00;
          font-size: 10px;
        }

        /* ==========================================================
           RESPONSIVE
           ========================================================== */

        @media (max-width: 1024px) {
          .details-layout {
            grid-template-columns: 320px 1fr;
            gap: 30px;
            padding: 28px;
          }

          .image-wrapper {
            min-height: 400px;
          }

          .book-title {
            font-size: 24px;
          }

          .price-current {
            font-size: 28px;
          }

          .related-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .book-details-page {
            padding: 16px 14px 40px;
          }

          .breadcrumb {
            font-size: 11.5px;
            margin-bottom: 16px;
          }

          .details-layout {
            grid-template-columns: 1fr;
            padding: 20px;
            gap: 24px;
            border-radius: 16px;
          }

          .image-wrapper {
            min-height: 320px;
            padding: 16px;
          }

          .image-wrapper img {
            max-width: 240px;
          }

          .trust-badges {
            gap: 6px;
          }

          .trust-item {
            padding: 10px 4px;
            font-size: 9.5px;
          }

          .trust-item svg {
            font-size: 14px;
          }

          .book-title {
            font-size: 22px;
          }

          .price-current {
            font-size: 26px;
          }

          .btn {
            padding: 13px 18px;
            font-size: 13.5px;
          }

          .btn-primary,
          .btn-accent {
            flex: 1 1 140px;
          }

          .related-title {
            font-size: 20px;
          }

          .related-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .related-image-wrap {
            height: 200px;
          }

          .toast {
            top: 70px;
            right: 12px;
            left: 12px;
            padding: 12px 16px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .book-details-page {
            padding: 12px 10px 32px;
          }

          .details-layout {
            padding: 16px;
            border-radius: 14px;
          }

          .image-wrapper {
            min-height: 260px;
            padding: 12px;
          }

          .image-wrapper img {
            max-width: 200px;
          }

          .discount-badge {
            top: 10px;
            left: 10px;
            padding: 4px 10px;
            font-size: 10.5px;
          }

          .category-tag {
            font-size: 10px;
            padding: 4px 11px;
          }

          .book-title {
            font-size: 19px;
          }

          .stars {
            font-size: 13px;
          }

          .book-description {
            font-size: 13px;
            line-height: 1.7;
            padding: 12px 0;
          }

          .price-current {
            font-size: 24px;
          }

          .price-original {
            font-size: 14px;
          }

          .save-badge {
            font-size: 10.5px;
            padding: 4px 10px;
          }

          .stock-status {
            font-size: 12px;
            padding: 8px 12px;
          }

          .btn {
            padding: 12px 16px;
            font-size: 13px;
            border-radius: 10px;
          }

          .btn-wishlist {
            padding: 12px 16px;
          }

          .related-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .related-image-wrap {
            height: 170px;
          }

          .related-info {
            padding: 10px 11px 11px;
          }

          .related-book-title {
            font-size: 12.5px;
          }
        }
      `}</style>
    </div>
  );
};

export default BookDetails;