import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    wishlist,
    loading: wishlistLoading,
    error,
    toggleWishlist,
  } = useWishlist();
  const { addToCart } = useCart();

  // ===== Auth loading =====
  if (authLoading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ color: '#1a237e', fontWeight: 700, fontSize: '15px' }}>
          Loading...
        </div>
      </div>
    );
  }

  // ===== Not logged in =====
  if (!user) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <FaHeart style={{ fontSize: '60px', color: '#ddd', marginBottom: '20px' }} />
        <h2 style={{ color: '#1a237e', marginBottom: '15px', fontWeight: 800 }}>
          Please Login
        </h2>
        <p style={{ color: '#666', marginBottom: '25px', fontWeight: 500 }}>
          Login to view your wishlist
        </p>
        <Link
          to="/login"
          style={{
            background: '#1a237e',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          Login
        </Link>
      </div>
    );
  }

  // ===== Wishlist loading (data fetch ho raha hai) =====
  if (wishlistLoading) {
    return (
      <div style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#1a237e', fontWeight: 800, marginBottom: '25px', fontSize: '26px' }}>
          My Wishlist
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                padding: '15px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                height: '380px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '220px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  background:
                    'linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 20%, #e0e0e0 40%)',
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 1.5s infinite linear',
                }}
              />
              <div
                style={{
                  height: '15px',
                  width: '80%',
                  marginBottom: '8px',
                  borderRadius: '4px',
                  background: '#e0e0e0',
                }}
              />
              <div
                style={{
                  height: '12px',
                  width: '60%',
                  marginBottom: '20px',
                  borderRadius: '4px',
                  background: '#e0e0e0',
                }}
              />
              <div
                style={{
                  height: '30px',
                  width: '100%',
                  borderRadius: '6px',
                  background: '#e0e0e0',
                }}
              />
            </div>
          ))}
        </div>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
        `}</style>
      </div>
    );
  }

  // ===== Empty wishlist =====
  if (!wishlist || wishlist.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <FaHeart style={{ fontSize: '60px', color: '#ddd', marginBottom: '20px' }} />
        <h2 style={{ color: '#1a237e', marginBottom: '10px', fontWeight: 800 }}>
          Your Wishlist is Empty
        </h2>
        <p style={{ color: '#666', marginBottom: '30px', fontWeight: 500 }}>
          Save your favorite books here ❤️
        </p>
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
          Browse Books
        </Link>
      </div>
    );
  }

  // ===== Show wishlist items =====
  return (
    <div style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#1a237e', fontWeight: 800, marginBottom: '25px', fontSize: '26px' }}>
        My Wishlist ({wishlist.length})
      </h1>

      {error && (
        <div
          style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '15px',
            fontWeight: 600,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        {wishlist.map((book) => {
          // ✅ Safe: skip invalid book
          if (!book || !book._id) return null;

          return (
            <div
              key={book._id}
              style={{
                background: '#fff',
                padding: '15px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Link
                to={`/book/${book.slug || book._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img
                  src={book.image}
                  alt={book.title}
                  style={{
                    width: '100%',
                    height: '220px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '12px',
                  }}
                  onError={(e) => {
                    e.target.src =
                      'https://via.placeholder.com/220x220?text=Book';
                  }}
                />
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#1a237e',
                    marginBottom: '5px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {book.title}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#666',
                    fontWeight: 500,
                    marginBottom: '10px',
                  }}
                >
                  {book.author}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#f57c00',
                    }}
                  >
                    ₹{book.price}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      fontWeight: 600,
                    }}
                  >
                    ⭐ {book.rating || 0}
                  </span>
                </div>
              </Link>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => addToCart(book._id, 1)}
                  style={{
                    flex: 1,
                    background: '#1a237e',
                    color: '#fff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                  }}
                >
                  <FaShoppingCart size={11} /> Add to Cart
                </button>
                <button
                  onClick={() => toggleWishlist(book._id)}
                  title="Remove from wishlist"
                  style={{
                    background: '#ffebee',
                    color: '#c62828',
                    border: 'none',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;