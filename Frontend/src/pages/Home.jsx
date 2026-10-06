import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaStar,
  FaHeart,
  FaRegHeart,
  FaFire,
  FaBookOpen,
  FaExclamationTriangle,
  FaArrowRight,
} from 'react-icons/fa';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Banner from '../components/common/Banner';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await api.get('/books/bestsellers');
        setBooks(data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleWishlistClick = async (e, bookId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = '/login';
      return;
    }
    await toggleWishlist(bookId);
  };

  const getDiscountPercent = (book) => {
    if (book.originalPrice && book.originalPrice > book.price) {
      return Math.round(
        ((book.originalPrice - book.price) / book.originalPrice) * 100
      );
    }
    if (book.discount) return book.discount;
    return 0;
  };

  return (
    <div>
      <Banner placement="home" />

      <div className="home-section">
        {/* Error — React Icon */}
        {error && (
          <div className="error-box">
            <FaExclamationTriangle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Section Header — React Icon */}
        <div className="section-header">
          <h2 className="section-title">
            <FaFire className="section-icon" />
            Best Sellers
          </h2>
          <Link to="/shop" className="view-all-link">
            View All <FaArrowRight className="view-all-icon" />
          </Link>
        </div>

        {loading ? (
          <Loader type="books" />
        ) : books.length === 0 ? (
          <div className="empty-state">
            <FaBookOpen className="empty-emoji" />
            <h3 className="empty-title">No books available yet</h3>
            <p className="empty-text">
              Check back soon for our latest collection
            </p>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => {
              const discount = getDiscountPercent(book);
              const inWishlist = user && isInWishlist(book._id);
              const isHovered = hoveredCard === book._id;

              return (
                <Link
                  key={book._id}
                  to={`/book/${book.slug || book._id}`}
                  className="book-card-link"
                >
                  <div
                    className={`book-card ${isHovered ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredCard(book._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="book-image-wrapper">
                      <img
                        src={book.image}
                        alt={book.title}
                        loading="lazy"
                        className={`book-image ${isHovered ? 'hovered' : ''}`}
                        onError={(e) => {
                          e.target.src =
                            'https://via.placeholder.com/280x260?text=Book';
                        }}
                      />
                      <div className="book-shadow" />

                      {discount > 0 && (
                        <span className="book-discount">
                          {discount}% OFF
                        </span>
                      )}

                      <button
                        onClick={(e) => handleWishlistClick(e, book._id)}
                        aria-label={
                          inWishlist
                            ? 'Remove from wishlist'
                            : 'Add to wishlist'
                        }
                        className={`book-wishlist ${
                          inWishlist ? 'active' : ''
                        }`}
                      >
                        {inWishlist ? <FaHeart /> : <FaRegHeart />}
                      </button>

                      {book.stock === 0 && (
                        <div className="book-out-of-stock">
                          <span>Out of Stock</span>
                        </div>
                      )}
                    </div>

                    <div className="book-content">
                      <h3 className="book-title" title={book.title}>
                        {book.title}
                      </h3>

                      <p className="book-author">{book.author}</p>

                      <div className="book-price-rating">
                        <div className="book-price-left">
                          <span className="book-price">₹{book.price}</span>
                          {book.originalPrice > book.price && (
                            <span className="book-original-price">
                              ₹{book.originalPrice}
                            </span>
                          )}
                        </div>

                        <div className="book-rating-right">
                          <FaStar className="book-rating-star" />
                          <span className="book-rating-value">
                            {book.rating?.toFixed(1) || '0.0'}
                          </span>
                          <span className="book-rating-count">
                            ({book.numReviews || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        /* ================= SECTION ================= */
        .home-section {
          padding: 40px 20px 30px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        /* ================= ERROR BOX ================= */
        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffebee;
          color: #c62828;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 600;
          font-size: 13px;
          border-left: 4px solid #c62828;
        }

        .error-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        /* ================= SECTION HEADER ================= */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1a237e;
          font-weight: 800;
          margin: 0;
          font-size: 22px;
          letter-spacing: -0.3px;
        }

        .section-icon {
          color: #f57c00;
          font-size: 20px;
        }

        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 700;
          color: #f57c00;
          text-decoration: none;
          border-bottom: 2px solid #f57c00;
          padding-bottom: 2px;
          transition: all 0.2s ease;
        }

        .view-all-link:hover {
          color: #1a237e;
          border-color: #1a237e;
        }

        .view-all-icon {
          font-size: 11px;
        }

        /* ================= EMPTY STATE ================= */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-emoji {
          font-size: 60px;
          color: #ddd;
          margin-bottom: 15px;
        }

        .empty-title {
          color: #1a237e;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .empty-text {
          color: #666;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        /* ================= GRID ================= */
        .books-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          grid-auto-rows: 1fr;
          gap: 20px;
          width: 100%;
          box-sizing: border-box;
        }

        .book-card-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          height: 100%;
          width: 100%;
          min-width: 0;
        }

        .book-card {
          background: #fffeff;
          border-radius: 2px;
          overflow: hidden;
          border: 1px solid #f0f0f0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          min-width: 0;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
        }

        .book-card.hovered {
          box-shadow: 0 12px 24px rgba(26, 35, 126, 0.12);
          transform: translateY(-6px);
        }

        /* ================= IMAGE ================= */
        .book-image-wrapper {
          position: relative;
          width: 100%;
          height: 260px;
          overflow: hidden;
          background: #f5f5f5;
          flex-shrink: 0;
        }

        .book-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .book-image.hovered {
          transform: scale(1.08);
        }

        .book-shadow {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.75) 0%,
            rgba(0,0,0,0.35) 50%,
            rgba(0,0,0,0) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        .book-discount {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #f57c00;
          color: #fff;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.3px;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(245,124,0,0.4);
        }

        .book-wishlist {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          border: none;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.25s ease;
          z-index: 2;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .book-wishlist:hover {
          background: #ffebee;
          color: #c62828;
          transform: scale(1.1);
        }

        .book-wishlist.active {
          background: #c62828;
          color: #fff;
        }

        .book-out-of-stock {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }

        .book-out-of-stock span {
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          padding: 8px 16px;
          border: 2px solid #fff;
          border-radius: 6px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* ================= CONTENT ================= */
        .book-content {
          padding: 10px 12px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 3px;
          min-height: 0;
          min-width: 0;
        }

        .book-title {
          font-size: 14px;
          font-weight: 700;
          color: #1a237e;
          margin: 0;
          line-height: 18px;
          height: 18px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .book-author {
          font-size: 11.5px;
          color: #666;
          font-weight: 500;
          margin: 0;
          line-height: 14px;
          height: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .book-price-rating {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-top: 6px;
          min-height: 22px;
          overflow: hidden;
        }

        .book-price-left {
          display: flex;
          align-items: baseline;
          gap: 5px;
          min-width: 0;
          overflow: hidden;
        }

        .book-price {
          font-size: 16px;
          font-weight: 800;
          color: #f57c00;
          letter-spacing: -0.3px;
          line-height: 1;
          white-space: nowrap;
        }

        .book-original-price {
          font-size: 11.5px;
          color: #999;
          text-decoration: line-through;
          font-weight: 500;
          line-height: 1;
          white-space: nowrap;
        }

        .book-rating-right {
          display: flex;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
        }

        .book-rating-star {
          color: #f57c00;
          font-size: 10.5px;
        }

        .book-rating-value {
          font-weight: 700;
          color: #1a237e;
          font-size: 11.5px;
          line-height: 1;
        }

        .book-rating-count {
          color: #999;
          font-weight: 500;
          font-size: 10.5px;
          line-height: 1;
        }

        /* ==========================================================
           RESPONSIVE
           ========================================================== */

        @media (max-width: 1024px) {
          .books-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .book-image-wrapper {
            height: 240px;
          }
        }

        @media (max-width: 768px) {
          .books-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .book-image-wrapper {
            height: 200px;
          }
          .book-title {
            font-size: 13.5px;
            line-height: 17px;
            height: 17px;
          }
          .book-price {
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .home-section {
            padding: 20px 10px 20px;
          }
          .section-title {
            font-size: 18px;
            gap: 8px;
          }
          .section-icon {
            font-size: 17px;
          }
          .books-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
          .book-image-wrapper {
            height: 160px;
          }
          .book-content {
            padding: 8px 8px 12px;
            gap: 2px;
          }
          .book-title {
            font-size: 12.5px;
            line-height: 15px;
            height: 15px;
          }
          .book-author {
            font-size: 10.5px;
            line-height: 13px;
            height: 13px;
          }
          .book-price {
            font-size: 14px;
          }
          .book-original-price {
            font-size: 10px;
          }
          .book-rating-value {
            font-size: 10.5px;
          }
          .book-rating-count {
            font-size: 9.5px;
          }
          .book-rating-star {
            font-size: 9.5px;
          }
          .book-discount {
            font-size: 9.5px;
            padding: 3px 7px;
            top: 6px;
            left: 6px;
          }
          .book-wishlist {
            width: 28px;
            height: 28px;
            font-size: 12px;
            top: 6px;
            right: 6px;
          }
          .empty-emoji {
            font-size: 50px;
          }
        }

        @media (max-width: 360px) {
          .home-section {
            padding: 15px 8px 15px;
          }
          .books-grid {
            gap: 6px;
          }
          .book-image-wrapper {
            height: 140px;
          }
          .book-title {
            font-size: 12px;
            line-height: 14px;
            height: 14px;
          }
          .book-price {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;