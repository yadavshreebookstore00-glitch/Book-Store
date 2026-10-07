import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaHeart,
  FaHome,
  FaStore,
  FaThLarge,
  FaGift,
  FaTag,
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState({ books: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Animated Placeholder State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [previousWordIndex, setPreviousWordIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const mobileInputRef = useRef(null);
  const navigate = useNavigate();

  const { user } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Dynamic Placeholder Words
  const placeholderWords = [
    'books',
    'authors',
    'categories',
    'publishers',
    'titles',
    'genres',
  ];

  const ANIMATION_DURATION = 600;
  const ROTATION_INTERVAL = 3000;

  // ============================================================
  // ✅ Get user initial + color
  // ============================================================
  const getUserInitial = () => {
    if (!user?.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  // ✅ Generate consistent color from name
  const getUserColor = () => {
    if (!user?.name) return '#1a237e';

    const colors = [
      '#1a237e', // Navy
      '#f57c00', // Orange
      '#2e7d32', // Green
      '#c62828', // Red
      '#6a1b9a', // Purple
      '#0277bd', // Blue
      '#00838f', // Teal
      '#ef6c00', // Amber
    ];

    // Hash name to get consistent color
    let hash = 0;
    for (let i = 0; i < user.name.length; i++) {
      hash = user.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // ============================================================
  // Smooth Placeholder Rotation
  // ============================================================
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setPreviousWordIndex(currentWordIndex);

      const changeTimer = setTimeout(() => {
        setCurrentWordIndex(
          (prev) => (prev + 1) % placeholderWords.length
        );
      }, 50);

      const clearTimer = setTimeout(() => {
        setPreviousWordIndex(null);
        setIsAnimating(false);
      }, ANIMATION_DURATION);

      return () => {
        clearTimeout(changeTimer);
        clearTimeout(clearTimer);
      };
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordIndex]);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMobileSearchOpen(false);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    setIsMobileMenuOpen(false);
    setTimeout(() => mobileInputRef.current?.focus(), 100);
  };

  // ===== Fetch suggestions =====
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

  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setActiveIndex(-1);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();

    if (activeIndex >= 0) {
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
    setIsMobileSearchOpen(false);
  };

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
      setIsMobileSearchOpen(false);
    }
  };

  const handleInputChange = (e) => setSearchTerm(e.target.value);

  const handleInputFocus = () => {
    if (searchTerm.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  // Animated Placeholder Component
  const AnimatedPlaceholder = () => {
    if (searchTerm) return null;

    return (
      <div className={styles.placeholderContainer}>
        <span className={styles.placeholderPrefix}>Search</span>

        <div className={styles.placeholderSlider}>
          {previousWordIndex !== null && (
            <span
              key={`prev-${previousWordIndex}`}
              className={`${styles.placeholderWord} ${styles.slideOutToBottom}`}
            >
              {placeholderWords[previousWordIndex]}
            </span>
          )}

          <span
            key={`curr-${currentWordIndex}`}
            className={`${styles.placeholderWord} ${
              isAnimating ? styles.slideInFromTop : styles.slideStatic
            }`}
          >
            {placeholderWords[currentWordIndex]}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
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
              <FaSearch className={styles.searchIcon} />
              <div className={styles.searchInputWrapper}>
                <AnimatedPlaceholder />
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                className={styles.searchBtn}
                aria-label="Search"
              >
                <FaSearch />
              </button>
            </form>

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

          {/* ===== Desktop Nav Menu ===== */}
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

            {/* Icons (desktop) */}
            <div className={styles.iconGroup}>
              <Link
                to="/wishlist"
                className={styles.iconLink}
                onClick={closeMenu}
                title="Wishlist"
              >
                <span className={styles.iconCircle}>
                  <FaHeart />
                  {user && wishlistCount > 0 && (
                    <span className={styles.cartBadge}>{wishlistCount}</span>
                  )}
                </span>
              </Link>
              <Link
                to="/cart"
                className={styles.iconLink}
                onClick={closeMenu}
                title="Cart"
              >
                <span className={styles.iconCircle}>
                  <FaShoppingCart />
                  {user && cartCount > 0 && (
                    <span className={styles.cartBadge}>{cartCount}</span>
                  )}
                </span>
              </Link>

              {/* ✅ User Avatar / Icon */}
              <Link
                to={user ? '/profile' : '/login'}
                className={styles.iconLink}
                onClick={closeMenu}
                title={user ? user.name : 'Login'}
              >
                {user ? (
                  <span
                    className={styles.userAvatar}
                    style={{ background: getUserColor() }}
                  >
                    {getUserInitial()}
                  </span>
                ) : (
                  <span className={styles.iconCircle}>
                    <FaUser />
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* ===== Mobile Right Actions ===== */}
          <div className={styles.mobileActions}>
            <button
              className={styles.mobileIconBtn}
              onClick={toggleMobileSearch}
              aria-label="Search"
            >
              {isMobileSearchOpen ? <FaTimes /> : <FaSearch />}
            </button>
            <button
              className={styles.mobileIconBtn}
              onClick={toggleMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* ===== Mobile Search Bar (Dropdown) ===== */}
        {isMobileSearchOpen && (
          <div className={styles.mobileSearchDropdown} ref={mobileSearchRef}>
            <form
              onSubmit={handleSearchSubmit}
              className={styles.mobileSearchFormNew}
            >
              <FaSearch className={styles.mobileSearchIconNew} />
              <div className={styles.searchInputWrapper}>
                <AnimatedPlaceholder />
                <input
                  ref={mobileInputRef}
                  type="text"
                  className={styles.mobileSearchInput}
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className={styles.mobileClearBtn}
                  aria-label="Clear"
                >
                  <FaTimes />
                </button>
              )}
            </form>

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
        )}
      </nav>

      {/* ===== Mobile Floating Bottom Nav ===== */}
      <nav className={styles.bottomNav}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? `${styles.bottomItem} ${styles.bottomActive}`
              : styles.bottomItem
          }
        >
          <FaHome className={styles.bottomIcon} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/shop"
          className={({ isActive }) =>
            isActive
              ? `${styles.bottomItem} ${styles.bottomActive}`
              : styles.bottomItem
          }
        >
          <FaStore className={styles.bottomIcon} />
          <span>Shop</span>
        </NavLink>

        <NavLink
          to="/categories"
          className={({ isActive }) =>
            isActive
              ? `${styles.bottomItem} ${styles.bottomActive}`
              : styles.bottomItem
          }
        >
          <FaThLarge className={styles.bottomIcon} />
          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            isActive
              ? `${styles.bottomItem} ${styles.bottomActive}`
              : styles.bottomItem
          }
        >
          <span className={styles.bottomIconWrap}>
            <FaGift className={styles.bottomIcon} />
            {user && wishlistCount > 0 && (
              <span className={styles.bottomBadge}>{wishlistCount}</span>
            )}
          </span>
          <span>Wishlist</span>
        </NavLink>

        {/* ✅ Profile / Login in Bottom Nav */}
        <NavLink
          to={user ? '/profile' : '/login'}
          className={({ isActive }) =>
            isActive
              ? `${styles.bottomItem} ${styles.bottomActive}`
              : styles.bottomItem
          }
        >
          <span className={styles.bottomIconWrap}>
            {user ? (
              <span
                className={styles.bottomUserAvatar}
                style={{ background: getUserColor() }}
              >
                {getUserInitial()}
              </span>
            ) : (
              <FaUser className={styles.bottomIcon} />
            )}
          </span>
          <span>{user ? user.name.split(' ')[0] : 'Login'}</span>
        </NavLink>
      </nav>
    </>
  );
};

export default Navbar;