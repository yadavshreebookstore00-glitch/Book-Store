import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaBolt, FaRegHeart } from 'react-icons/fa';
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
      setToast('✅ Added to cart!');
    } else {
      setToast(`⚠️ ${result.message}`);
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
      setToast(
        result.action === 'added'
          ? '❤️ Added to wishlist!'
          : '💔 Removed from wishlist'
      );
    }
  };

  // ===== Buy Now =====
  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Buy Now - seedha checkout pe le jao with single item
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

  if (loading) return <Loader type="details" />;

  if (error || !book) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '80px', color: '#1a237e', margin: 0 }}>404</h1>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Book Not Found</h2>
        <Link
          to="/shop"
          style={{
            background: '#1a237e',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(book._id);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            background: '#1a237e',
            color: '#fff',
            padding: '14px 22px',
            borderRadius: '8px',
            fontWeight: 700,
            zIndex: 1000,
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            animation: 'slideIn 0.3s',
          }}
        >
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 600, color: '#666', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <Link to="/shop" style={{ color: '#666', textDecoration: 'none' }}>Shop</Link>
        <span>›</span>
        <span style={{ color: '#1a237e' }}>{book.title}</span>
      </div>

      {/* Main Content - Responsive Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          background: '#fff',
          padding: 'clamp(20px, 4vw, 40px)',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        {/* Image */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src={book.image}
            alt={book.title}
            style={{
              width: '100%',
              maxWidth: '380px',
              height: 'auto',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* Info */}
        <div>
          <h1 style={{ color: '#1a237e', fontWeight: 800, fontSize: 'clamp(20px, 3vw, 28px)', marginBottom: '10px', lineHeight: 1.3 }}>
            {book.title}
          </h1>
          <p style={{ color: '#666', fontWeight: 600, marginBottom: '15px' }}>
            by <span style={{ color: '#1a237e' }}>{book.author}</span>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ color: '#f57c00', fontWeight: 700, fontSize: '16px' }}>
              ⭐ {book.rating}
            </span>
            <span style={{ color: '#666', fontSize: '13px', fontWeight: 500 }}>
              ({book.numReviews} reviews)
            </span>
            <span style={{ background: '#e8eaf6', color: '#1a237e', padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
              {book.category}
            </span>
          </div>

          <p style={{ color: '#555', fontWeight: 500, lineHeight: 1.7, marginBottom: '25px', fontSize: '14px' }}>
            {book.description}
          </p>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#f57c00' }}>
              ₹{book.price}
            </span>
            {book.originalPrice > book.price && (
              <>
                <span style={{ fontSize: '16px', color: '#999', textDecoration: 'line-through' }}>
                  ₹{book.originalPrice}
                </span>
                <span style={{ background: '#4caf50', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                  {book.discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '20px', color: book.stock > 10 ? '#2e7d32' : book.stock > 0 ? '#f57c00' : '#c62828' }}>
            {book.stock > 10
              ? `✅ In Stock (${book.stock} available)`
              : book.stock > 0
              ? `⚠️ Only ${book.stock} left!`
              : '❌ Out of Stock'}
          </p>

          {/* Quantity Selector */}
          {book.stock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: '#1a237e', fontSize: '14px' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ background: '#f5f5f5', border: 'none', width: '38px', height: '38px', fontSize: '18px', fontWeight: 700, cursor: 'pointer', color: '#1a237e' }}
                >
                  −
                </button>
                <span style={{ width: '50px', textAlign: 'center', fontWeight: 700, fontSize: '15px', color: '#1a237e' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))}
                  style={{ background: '#f5f5f5', border: 'none', width: '38px', height: '38px', fontSize: '18px', fontWeight: 700, cursor: 'pointer', color: '#1a237e' }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0 || addingToCart}
              style={{
                flex: '1 1 140px',
                background: book.stock === 0 ? '#999' : '#1a237e',
                color: '#fff',
                border: 'none',
                padding: '14px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: book.stock === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minWidth: '140px',
              }}
            >
              <FaShoppingCart /> {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={book.stock === 0}
              style={{
                flex: '1 1 140px',
                background: book.stock === 0 ? '#999' : '#f57c00',
                color: '#fff',
                border: 'none',
                padding: '14px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: book.stock === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minWidth: '140px',
              }}
            >
              <FaBolt /> Buy Now
            </button>

            <button
              onClick={handleWishlist}
              style={{
                background: inWishlist ? '#ffebee' : 'transparent',
                color: inWishlist ? '#c62828' : '#1a237e',
                border: `2px solid ${inWishlist ? '#c62828' : '#1a237e'}`,
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '60px',
              }}
            >
              {inWishlist ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          {/* Extra Info */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', fontSize: '13px', color: '#666', fontWeight: 500 }}>
            {book.language && <div><strong style={{ color: '#1a237e' }}>Language:</strong> {book.language}</div>}
            {book.pages > 0 && <div><strong style={{ color: '#1a237e' }}>Pages:</strong> {book.pages}</div>}
            {book.publisher && <div><strong style={{ color: '#1a237e' }}>Publisher:</strong> {book.publisher}</div>}
          </div>
        </div>
      </div>

      {/* Related Books */}
      {related.length > 0 && (
        <div style={{ marginTop: '50px' }}>
          <h2 style={{ color: '#1a237e', fontWeight: 800, marginBottom: '20px', fontSize: '22px' }}>
            You May Also Like
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
            {related.map((b) => (
              <Link key={b._id} to={`/book/${b.slug || b._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <img src={b.image} alt={b.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1a237e', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#f57c00' }}>₹{b.price}</span>
                    <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>⭐ {b.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BookDetails;