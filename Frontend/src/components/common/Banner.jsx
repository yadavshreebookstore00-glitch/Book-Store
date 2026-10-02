import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaChevronLeft,
  FaChevronRight,
  FaArrowRight,
} from 'react-icons/fa';
import api from '../../services/api';
import styles from './Banner.module.css';

const Banner = ({ placement = 'home' }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const SLIDE_DURATION = 5000;

  // ===== Fetch Banners =====
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/banners?placement=${placement}`);
        setBanners(data || []);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Banner fetch error:', err);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [placement]);

  // ===== Auto Slide =====
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  const goTo = useCallback((index) => setCurrentIndex(index), []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // ===== Keyboard Navigation =====
  useEffect(() => {
    const handleKey = (e) => {
      if (banners.length <= 1) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [banners.length, nextSlide, prevSlide]);

  // ===== Loading Skeleton =====
  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <div className={styles.loaderSkeleton} />
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className={styles.bannerWrapper}>
      <div
        className={styles.bannerContainer}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* ===== Slides ===== */}
        <div className={styles.slidesTrack}>
          {banners.map((b, index) => (
            <div
              key={b._id || index}
              className={`${styles.slide} ${
                index === currentIndex ? styles.slideActive : ''
              }`}
              aria-hidden={index !== currentIndex}
            >
              <Link
                to={b.link || '/shop'}
                className={styles.slideLink}
                tabIndex={index === currentIndex ? 0 : -1}
              >
                {/* Image */}
                <img
                  src={b.image}
                  alt={b.title || `Banner ${index + 1}`}
                  className={styles.slideImage}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />

                {/* Gradient Overlay */}
                <div className={styles.slideOverlay} />

                {/* Content */}
                {(b.title || b.subtitle || b.buttonText) && (
                  <div className={styles.slideContent}>
                    {b.title && (
                      <h2 className={styles.slideTitle}>{b.title}</h2>
                    )}
                    {b.subtitle && (
                      <p className={styles.slideSubtitle}>{b.subtitle}</p>
                    )}
                    {b.buttonText && (
                      <span className={styles.slideButton}>
                        {b.buttonText}
                        {/* ✅ React Icon Arrow */}
                        <FaArrowRight className={styles.slideButtonArrow} />
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>

        {/* ===== Left Arrow ===== */}
        {banners.length > 1 && (
          <button
            className={`${styles.navArrow} ${styles.navArrowLeft}`}
            onClick={(e) => {
              e.preventDefault();
              prevSlide();
            }}
            aria-label="Previous banner"
          >
            <FaChevronLeft />
          </button>
        )}

        {/* ===== Right Arrow ===== */}
        {banners.length > 1 && (
          <button
            className={`${styles.navArrow} ${styles.navArrowRight}`}
            onClick={(e) => {
              e.preventDefault();
              nextSlide();
            }}
            aria-label="Next banner"
          >
            <FaChevronRight />
          </button>
        )}

        {/* ===== Progress Dots ===== */}
        {banners.length > 1 && (
          <div className={styles.dotsWrapper}>
            {banners.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${
                  i === currentIndex ? styles.dotActive : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
              >
                {i === currentIndex && !isPaused && (
                  <span
                    className={styles.dotProgress}
                    style={{ animationDuration: `${SLIDE_DURATION}ms` }}
                  />
                )}
                {i === currentIndex && isPaused && (
                  <span
                    className={styles.dotProgress}
                    style={{ animationPlayState: 'paused' }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* ===== Slide Counter ===== */}
        {banners.length > 1 && (
          <div className={styles.counter}>
            <span className={styles.counterCurrent}>
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className={styles.counterDivider}>/</span>
            <span className={styles.counterTotal}>
              {String(banners.length).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;