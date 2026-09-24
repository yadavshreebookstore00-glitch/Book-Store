import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Banner = ({ placement = 'home' }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ===== Fetch Banners by Placement =====
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
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const goTo = (index) => setCurrentIndex(index);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  // ===== Loading Skeleton =====
  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1150px',
            height: '300px',
            borderRadius: '12px',
            background:
              'linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 20%, #e0e0e0 40%)',
            backgroundSize: '1000px 100%',
            animation: 'shimmer 1.5s infinite linear',
          }}
        />
      </div>
    );
  }

  if (banners.length === 0) return null;

  const banner = banners[currentIndex];

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 20px 0 20px',
      }}
    >
      {/* ✅ MAX WIDTH 1200px CONTAINER */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1170px',
          height: '480px',
          overflow: 'hidden',
          borderRadius: '12px',
          background: '#000',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        {/* ===== Banner Image + Overlay (Clickable) ===== */}
        <Link
          to={banner.link || '/shop'}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            textDecoration: 'none',
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={banner.image}
              alt={banner.title || 'Banner'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* ===== Overlay with Text ===== */}
            {(banner.title || banner.subtitle || banner.buttonText) && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 clamp(20px, 5vw, 60px)',
                }}
              >
                <div style={{ maxWidth: '600px' }}>
                  {banner.title && (
                    <h1
                      style={{
                        color: '#fff',
                        fontSize: 'clamp(24px, 4vw, 44px)',
                        fontWeight: 800,
                        marginBottom: '15px',
                        lineHeight: 1.2,
                        letterSpacing: '-0.5px',
                        textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                        margin: '0 0 15px 0',
                      }}
                    >
                      {banner.title}
                    </h1>
                  )}
                  {banner.subtitle && (
                    <p
                      style={{
                        color: '#eee',
                        fontSize: 'clamp(14px, 1.5vw, 17px)',
                        fontWeight: 500,
                        marginBottom: '25px',
                        lineHeight: 1.6,
                        textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
                        margin: '0 0 25px 0',
                      }}
                    >
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.buttonText && (
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#f57c00',
                        color: '#fff',
                        padding: '13px 32px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        boxShadow: '0 4px 15px rgba(245,124,0,0.4)',
                      }}
                    >
                      {banner.buttonText} →
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* ===== Left Arrow ===== */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                prevSlide();
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '15px',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)',
                border: 'none',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '22px',
                fontWeight: 700,
                color: '#1a237e',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
              }}
            >
              ‹
            </button>

            {/* ===== Right Arrow ===== */}
            <button
              onClick={(e) => {
                e.preventDefault();
                nextSlide();
              }}
              style={{
                position: 'absolute',
                top: '50%',
                right: '15px',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)',
                border: 'none',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '22px',
                fontWeight: 700,
                color: '#1a237e',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
              }}
            >
              ›
            </button>
          </>
        )}

        {/* ===== Dots Indicator ===== */}
        {banners.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '18px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              zIndex: 10,
            }}
          >
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(i);
                }}
                style={{
                  width: i === currentIndex ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  border: 'none',
                  background:
                    i === currentIndex ? '#f57c00' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;