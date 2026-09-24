import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaHeart,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import useDebounce from '../../hooks/useDebounce';
import SearchSuggestions from './SearchSuggestions';
import api from '../../services/api';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState({ books: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { user } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  // ✅ Debounce search term (300ms)
  const debouncedSearch = useDebounce(searchTerm, 300);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  // ===== Fetch suggestions when debounced term changes =====
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearch || debouncedSearch.trim().length < 2) {
        setSuggestions({ books: [], categories: [] });
        setShowSuggestions(false);
        return;
      }

      try {
        setLoadingSuggestions(true);
        setShowSuggestions(true);
        setActiveIndex(-1);

        const { data } = await api.get(
          `/books/suggestions?q=${encodeURIComponent(debouncedSearch.trim())}`
        );

        setSuggestions({
          books: data.books || [],
          categories: data.categories || [],
        });
      } catch (err) {
        console.error('Suggestions error:', err);
        setSuggestions({ books: [], categories: [] });
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch]);

  // ===== Close on click outside =====
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===== Close suggestions =====
  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setActiveIndex(-1);
  }, []);

  // ===== Handle search submit =====
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();

    if (activeIndex >= 0) {
      // Suggestion select karo
      const totalCategories = suggestions.categories?.length || 0;
      if (activeIndex < totalCategories) {
        const cat = suggestions.categories[activeIndex];
        navigate(`/shop?category=${encodeURIComponent(cat)}`);
      } else {
        const book = suggestions.books[activeIndex - totalCategories];
        if (book) navigate(`/book/${book.slug || book._id}`);
      }
    } else if (searchTerm.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchTerm.trim())}`);
    }

    closeSuggestions();
    setSearchTerm('');
  };

  // ===== Keyboard navigation =====
  const handleKeyDown = (e) => {
    const totalItems =
      (suggestions.categories?.length || 0) +
      (suggestions.books?.length || 0);

    if (!showSuggestions || totalItems === 0) {
      if (e.key === 'Enter' && searchTerm.trim()) {
        handleSearchSubmit(e);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit(e);
    } else if (e.key === 'Escape') {
      closeSuggestions();
      inputRef.current?.blur();
    }
  };

  // ===== Handle input change =====
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // ===== Handle input focus =====
  const handleInputFocus = () => {
    if (searchTerm.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* ===== Logo ===== */}
        <Link to="/" className={styles.logoWrapper} onClick={closeMenu}>
          <img
            src="/logo.png"
            alt="Yadav Shree Book Store"
            className={styles.logoImg}
          />
        </Link>

        {/* ===== Desktop Search ===== */}
        <div className={styles.searchWrapper} ref={searchRef}>
          <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search books, authors, or categories..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              autoComplete="off"
            />
            <button type="submit" className={styles.searchBtn}>
              <FaSearch />
            </button>
          </form>

          {/* ✅ Suggestions Dropdown */}
          {showSuggestions && (
            <SearchSuggestions
              suggestions={suggestions}
              loading={loadingSuggestions}
              onSelect={closeSuggestions}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              searchTerm={searchTerm}
            />
          )}
        </div>

        {/* ===== Menu ===== */}
        <div
          className={`${styles.navMenu} ${
            isMobileMenuOpen ? styles.active : ''
          }`}
        >
          <ul className={styles.navLinks}>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.activeLink}`
                    : styles.navLink
                }
                onClick={closeMenu}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.activeLink}`
                    : styles.navLink
                }
                onClick={closeMenu}
              >
                Shop
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.activeLink}`
                    : styles.navLink
                }
                onClick={closeMenu}
              >
                Categories
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.activeLink}`
                    : styles.navLink
                }
                onClick={closeMenu}
              >
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.activeLink}`
                    : styles.navLink
                }
                onClick={closeMenu}
              >
                Contact
              </NavLink>
            </li>
          </ul>

          {/* Mobile Search - Same logic */}
          <div className={styles.mobileSearch}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%' }}>
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={handleInputChange}
              />
              <button type="submit">
                <FaSearch />
              </button>
            </form>
          </div>

          {/* Icons */}
          <div className={styles.iconGroup}>
            <Link
              to="/wishlist"
              className={styles.iconLink}
              onClick={closeMenu}
              title="Wishlist"
            >
              <FaHeart />
              {user && wishlistCount > 0 && (
                <span className={styles.cartBadge}>{wishlistCount}</span>
              )}
            </Link>
            <Link
              to="/cart"
              className={styles.iconLink}
              onClick={closeMenu}
              title="Cart"
            >
              <FaShoppingCart />
              {user && cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>
            <Link
              to={user ? '/profile' : '/login'}
              className={styles.iconLink}
              onClick={closeMenu}
              title={user ? 'Profile' : 'Login'}
            >
              <FaUser />
            </Link>
          </div>
        </div>

        {/* ===== Mobile Toggle ===== */}
        <button className={styles.menuToggle} onClick={toggleMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;