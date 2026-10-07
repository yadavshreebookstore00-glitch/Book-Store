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
import styles from './Home.module.css';

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

      <div className={styles.homeSection}>
        {/* Error */}
        {error && (
          <div className={styles.errorBox}>
            <FaExclamationTriangle className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        )}

        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <FaFire className={styles.sectionIcon} />
            Best Sellers
          </h2>
          <Link to="/shop" className={styles.viewAllLink}>
            View All <FaArrowRight className={styles.viewAllIcon} />
          </Link>
        </div>

        {loading ? (
          <Loader type="books" />
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <FaBookOpen className={styles.emptyEmoji} />
            <h3 className={styles.emptyTitle}>No books available yet</h3>
            <p className={styles.emptyText}>
              Check back soon for our latest collection
            </p>
          </div>
        ) : (
          <div className={styles.booksGrid}>
            {books.map((book) => {
              const discount = getDiscountPercent(book);
              const inWishlist = user && isInWishlist(book._id);
              const isHovered = hoveredCard === book._id;

              return (
                <Link
                  key={book._id}
                  to={`/book/${book.slug || book._id}`}
                  className={styles.bookCardLink}
                >
                  <div
                    className={`${styles.bookCard} ${
                      isHovered ? styles.bookCardHovered : ''
                    }`}
                    onMouseEnter={() => setHoveredCard(book._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={styles.bookImageWrapper}>
                      <img
                        src={book.image}
                        alt={book.title}
                        loading="lazy"
                        className={`${styles.bookImage} ${
                          isHovered ? styles.bookImageHovered : ''
                        }`}
                        onError={(e) => {
                          e.target.src =
                            'https://via.placeholder.com/280x260?text=Book';
                        }}
                      />
                      <div className={styles.bookShadow} />

                      {discount > 0 && (
                        <span className={styles.bookDiscount}>
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
                        className={`${styles.bookWishlist} ${
                          inWishlist ? styles.bookWishlistActive : ''
                        }`}
                      >
                        {inWishlist ? <FaHeart /> : <FaRegHeart />}
                      </button>

                      {book.stock === 0 && (
                        <div className={styles.bookOutOfStock}>
                          <span>Out of Stock</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.bookContent}>
                      <h3 className={styles.bookTitle} title={book.title}>
                        {book.title}
                      </h3>

                      <p className={styles.bookAuthor}>{book.author}</p>

                      <div className={styles.bookPriceRating}>
                        <div className={styles.bookPriceLeft}>
                          <span className={styles.bookPrice}>
                            ₹{book.price}
                          </span>
                          {book.originalPrice > book.price && (
                            <span className={styles.bookOriginalPrice}>
                              ₹{book.originalPrice}
                            </span>
                          )}
                        </div>

                        <div className={styles.bookRatingRight}>
                          <FaStar className={styles.bookRatingStar} />
                          <span className={styles.bookRatingValue}>
                            {book.rating?.toFixed(1) || '0.0'}
                          </span>
                          <span className={styles.bookRatingCount}>
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
    </div>
  );
};

export default Home;