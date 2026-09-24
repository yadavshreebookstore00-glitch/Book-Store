import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBook, FaTag, FaArrowRight } from 'react-icons/fa';
import styles from './SearchSuggestions.module.css';

const SearchSuggestions = ({
  suggestions,
  loading,
  onSelect,
  activeIndex,
  setActiveIndex,
  searchTerm,
}) => {
  const navigate = useNavigate();

  // Flatten list: books + categories
  const allItems = [
    ...(suggestions.categories || []).map((c) => ({
      type: 'category',
      label: c,
      value: c,
    })),
    ...(suggestions.books || []).map((b) => ({
      type: 'book',
      label: b.title,
      value: b,
    })),
  ];

  if (loading) {
    return (
      <div className={styles.dropdown}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  if (allItems.length === 0 && searchTerm.length >= 2) {
    return (
      <div className={styles.dropdown}>
        <div className={styles.empty}>
          <FaSearch />
          <p>No results for "<strong>{searchTerm}</strong>"</p>
        </div>
      </div>
    );
  }

  if (allItems.length === 0) return null;

  const handleClick = (item) => {
    onSelect();
    if (item.type === 'category') {
      navigate(`/shop?category=${encodeURIComponent(item.value)}`);
    } else {
      navigate(`/book/${item.value.slug || item.value._id}`);
    }
  };

  return (
    <div className={styles.dropdown}>
      {/* Categories */}
      {suggestions.categories?.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <FaTag size={10} />
            <span>Categories</span>
          </div>
          {suggestions.categories.map((cat, i) => (
            <div
              key={`cat-${i}`}
              className={`${styles.item} ${
                activeIndex === i ? styles.active : ''
              }`}
              onClick={() => handleClick({ type: 'category', value: cat })}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className={styles.itemIcon}>
                <FaTag />
              </div>
              <div className={styles.itemContent}>
                <p className={styles.itemTitle}>{cat}</p>
                <p className={styles.itemSub}>Category</p>
              </div>
              <FaArrowRight className={styles.arrow} />
            </div>
          ))}
        </>
      )}

      {/* Books */}
      {suggestions.books?.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <FaBook size={10} />
            <span>Books</span>
          </div>
          {suggestions.books.map((book, i) => {
            const index = (suggestions.categories?.length || 0) + i;
            return (
              <div
                key={book._id}
                className={`${styles.item} ${
                  activeIndex === index ? styles.active : ''
                }`}
                onClick={() => handleClick({ type: 'book', value: book })}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <img
                  src={book.image}
                  alt={book.title}
                  className={styles.itemImage}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/40x50';
                  }}
                />
                <div className={styles.itemContent}>
                  <p className={styles.itemTitle}>{book.title}</p>
                  <p className={styles.itemSub}>
                    by {book.author} • ₹{book.price}
                  </p>
                </div>
                <FaArrowRight className={styles.arrow} />
              </div>
            );
          })}
        </>
      )}

      {/* View All */}
      {searchTerm.length >= 2 && (
        <div
          className={styles.viewAll}
          onClick={() => {
            onSelect();
            navigate(`/shop?keyword=${encodeURIComponent(searchTerm)}`);
          }}
        >
          <FaSearch size={11} />
          <span>View all results for "{searchTerm}"</span>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;