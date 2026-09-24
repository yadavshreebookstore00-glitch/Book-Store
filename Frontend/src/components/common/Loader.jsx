import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ type = 'default' }) => {
  // Default Skeleton (Book Grid)
  if (type === 'default' || type === 'books') {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.sectionTitle + ' ' + styles.skeleton}></div>
        <div className={styles.booksGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={styles.bookCard}>
              <div className={styles.bookImage + ' ' + styles.skeleton}></div>
              <div className={styles.bookTitle + ' ' + styles.skeleton}></div>
              <div className={styles.bookAuthor + ' ' + styles.skeleton}></div>
              <div className={styles.bookPrice + ' ' + styles.skeleton}></div>
              <div className={styles.bookButton + ' ' + styles.skeleton}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Home Page Skeleton
  if (type === 'home') {
    return (
      <div className={styles.loaderContainer}>
        {/* Hero Section */}
        <div className={styles.heroSkeleton}>
          <div className={styles.heroImage + ' ' + styles.skeleton}></div>
          <div className={styles.heroContent}>
            <div className={styles.heroTitle + ' ' + styles.skeleton}></div>
            <div className={styles.heroSubtitle + ' ' + styles.skeleton}></div>
            <div className={styles.heroSubtitle2 + ' ' + styles.skeleton}></div>
            <div className={styles.heroButton + ' ' + styles.skeleton}></div>
          </div>
        </div>

        {/* Best Sellers */}
        <div className={styles.sectionTitle + ' ' + styles.skeleton}></div>
        <div className={styles.booksGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.bookCard}>
              <div className={styles.bookImage + ' ' + styles.skeleton}></div>
              <div className={styles.bookTitle + ' ' + styles.skeleton}></div>
              <div className={styles.bookAuthor + ' ' + styles.skeleton}></div>
              <div className={styles.bookPrice + ' ' + styles.skeleton}></div>
              <div className={styles.bookButton + ' ' + styles.skeleton}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Shop Page Skeleton
  if (type === 'shop') {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.shopLayout}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarTitle + ' ' + styles.skeleton}></div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.sidebarItem + ' ' + styles.skeleton}></div>
            ))}
          </div>

          {/* Grid */}
          <div>
            <div className={styles.sectionTitle + ' ' + styles.skeleton}></div>
            <div className={styles.booksGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={styles.bookCard}>
                  <div className={styles.bookImage + ' ' + styles.skeleton}></div>
                  <div className={styles.bookTitle + ' ' + styles.skeleton}></div>
                  <div className={styles.bookAuthor + ' ' + styles.skeleton}></div>
                  <div className={styles.bookPrice + ' ' + styles.skeleton}></div>
                  <div className={styles.bookButton + ' ' + styles.skeleton}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Book Details Skeleton
  if (type === 'details') {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.detailsLayout}>
          <div className={styles.detailsImage + ' ' + styles.skeleton}></div>
          <div className={styles.detailsContent}>
            <div className={styles.detailsTitle + ' ' + styles.skeleton}></div>
            <div className={styles.detailsAuthor + ' ' + styles.skeleton}></div>
            <div className={styles.detailsRating + ' ' + styles.skeleton}></div>
            <div className={styles.detailsDesc + ' ' + styles.skeleton}></div>
            <div className={styles.detailsDesc2 + ' ' + styles.skeleton}></div>
            <div className={styles.detailsDesc3 + ' ' + styles.skeleton}></div>
            <div className={styles.detailsPrice + ' ' + styles.skeleton}></div>
            <div className={styles.detailsBtn + ' ' + styles.skeleton}></div>
          </div>
        </div>
      </div>
    );
  }

  // Cart Page Skeleton
  if (type === 'cart') {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.sectionTitle + ' ' + styles.skeleton}></div>
        <div className={styles.cartLayout}>
          {/* Cart Items */}
          <div>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.cartItem}>
                <div className={styles.cartItemImage + ' ' + styles.skeleton}></div>
                <div className={styles.cartItemContent}>
                  <div className={styles.cartItemTitle + ' ' + styles.skeleton}></div>
                  <div className={styles.cartItemAuthor + ' ' + styles.skeleton}></div>
                  <div className={styles.cartItemPrice + ' ' + styles.skeleton}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryTitle + ' ' + styles.skeleton}></div>
            <div className={styles.summaryRow + ' ' + styles.skeleton}></div>
            <div className={styles.summaryRow + ' ' + styles.skeleton}></div>
            <div className={styles.summaryRow + ' ' + styles.skeleton}></div>
            <div className={styles.summaryTotal + ' ' + styles.skeleton}></div>
            <div className={styles.summaryButton + ' ' + styles.skeleton}></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.booksGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.bookCard}>
            <div className={styles.bookImage + ' ' + styles.skeleton}></div>
            <div className={styles.bookTitle + ' ' + styles.skeleton}></div>
            <div className={styles.bookAuthor + ' ' + styles.skeleton}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loader;