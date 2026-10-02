import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBook,
  FaTruck,
  FaUndo,
  FaHeadset,
  FaUsers,
  FaAward,
  FaArrowRight,
  FaQuoteLeft,
  FaHeart,
} from 'react-icons/fa';

// ============================================================
// Animated Bubble Background
// ============================================================
const BubbleBackground = () => {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const generatedBubbles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 180 + 40,
      left: Math.random() * 100,
      delay: Math.random() * 20,
      duration: Math.random() * 20 + 20,
      color: [
        'rgba(26, 35, 126, 0.15)',
        'rgba(245, 124, 0, 0.12)',
        'rgba(57, 73, 171, 0.1)',
        'rgba(255, 152, 0, 0.08)',
        'rgba(106, 27, 154, 0.08)',
      ][Math.floor(Math.random() * 5)],
    }));
    setBubbles(generatedBubbles);
  }, []);

  return (
    <div className="bubble-bg">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            background: bubble.color,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

// ============================================================
// Main About Component
// ============================================================
const About = () => {
  const features = [
    {
      Icon: FaBook,
      title: 'Huge Collection',
      desc: 'Over 10,000+ books across all genres and categories.',
      color: '#1a237e',
      gradient: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
    },
    {
      Icon: FaTruck,
      title: 'Fast Delivery',
      desc: 'Quick and reliable shipping across India.',
      color: '#f57c00',
      gradient: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
    },
    {
      Icon: FaUndo,
      title: 'Easy Returns',
      desc: '7-day hassle-free return policy on all orders.',
      color: '#2e7d32',
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
    },
    {
      Icon: FaHeadset,
      title: '24/7 Support',
      desc: 'Our team is always here to help you out.',
      color: '#c62828',
      gradient: 'linear-gradient(135deg, #c62828 0%, #e53935 100%)',
    },
    {
      Icon: FaUsers,
      title: 'Trusted by Readers',
      desc: '10,000+ happy customers and growing every day.',
      color: '#6a1b9a',
      gradient: 'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%)',
    },
    {
      Icon: FaAward,
      title: 'Best Prices',
      desc: 'Competitive prices with regular discounts.',
      color: '#0277bd',
      gradient: 'linear-gradient(135deg, #0277bd 0%, #039be5 100%)',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Books Available', color: '#1a237e' },
    { number: '50,000+', label: 'Happy Customers', color: '#f57c00' },
    { number: '500+', label: 'Authors', color: '#2e7d32' },
    { number: '4.8★', label: 'Average Rating', color: '#6a1b9a' },
  ];

  return (
    <div className="about-page">
      <BubbleBackground />

      {/* ===== Content Container ===== */}
      <div className="about-content">
        {/* ============================================================
            HERO SECTION — Compact so story is visible
            ============================================================ */}
        <div className="hero-section">
          <div className="hero-badge">
            <FaHeart className="hero-badge-icon" />
            <span>Trusted Since 2024</span>
          </div>

          <h1 className="hero-title">
            About{' '}
            <span className="hero-title-gradient">Yadav Shree</span> Book Store
          </h1>

          <p className="hero-description">
            Your one-stop destination for books of all genres — from timeless
            classics to modern bestsellers.
          </p>
        </div>

        {/* ============================================================
            OUR STORY (With divider BELOW)
            ============================================================ */}
        <div className="story-card">
          <div className="story-header">
            <div className="story-icon">
              <FaQuoteLeft />
            </div>
            <h2 className="story-title">Our Story</h2>
          </div>

          <p className="story-text">
            Yadav Shree Book Store started with a simple mission: to make books
            accessible to everyone, everywhere. What began as a small collection
            of hand-picked titles has grown into a comprehensive online
            bookstore serving thousands of readers across India.
          </p>

          <p className="story-text">
            We carefully curate our collection to include books across all
            categories — Fiction, Non-Fiction, Self Help, Business, Biography,
            Children's books, and more. Whether you're a casual reader or an
            avid bibliophile, we have something for you.
          </p>
        </div>

        {/* ✅ Book Divider — BELOW Our Story */}
        <div className="book-divider">
          <span className="book-divider-line" />
          <div className="book-divider-icon">
            <FaBook />
          </div>
          <span className="book-divider-line" />
        </div>

        {/* ============================================================
            WHY CHOOSE US
            ============================================================ */}
        <div className="section-header">
          <h2 className="section-title">
            Why Choose <span className="section-title-gradient">Us?</span>
          </h2>
          <p className="section-subtitle">
            Here's what makes us different from the rest
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, i) => {
            const Icon = feature.Icon;
            return (
              <div key={i} className="feature-card">
                <div
                  className="feature-icon"
                  style={{
                    background: feature.gradient,
                    boxShadow: `0 8px 24px ${feature.color}35`,
                  }}
                >
                  <Icon />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
                <div
                  className="feature-underline"
                  style={{ background: feature.gradient }}
                />
              </div>
            );
          })}
        </div>

        {/* ============================================================
            STATS SECTION — Light Theme
            ============================================================ */}
        <div className="stats-section">
          <div className="section-header">
            <h2 className="section-title">
              Our <span className="section-title-gradient">Numbers</span>
            </h2>
            <p className="section-subtitle">
              Trusted by thousands of readers across India
            </p>
          </div>

          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon-wrap" style={{ background: `${stat.color}12` }}>
                  <span className="stat-icon-dot" style={{ background: stat.color }} />
                </div>
                <div className="stat-number" style={{ color: stat.color }}>
                  {stat.number}
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-underline" style={{ background: stat.color }} />
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            CTA SECTION
            ============================================================ */}
        <div className="cta-card">
          <h2 className="cta-title">Ready to Start Reading?</h2>
          <p className="cta-text">
            Explore our collection and find your next favorite book.
          </p>

          <Link to="/shop" className="cta-button">
            Browse Books
            <FaArrowRight className="cta-button-icon" />
          </Link>
        </div>
      </div>

      {/* ============================================================
          CSS
          ============================================================ */}
      <style>{`
        /* ================= PAGE ================= */
        .about-page {
          position: relative;
          padding: 40px 20px 60px;      /* ✅ Reduced top padding */
          background: linear-gradient(180deg, #f8f7f4 0%, #ffffff 100%);
          overflow: hidden;
          min-height: auto;              /* ✅ No forced height */
        }

        /* ==========================================================
           ANIMATED BUBBLE BACKGROUND
           ========================================================== */
        .bubble-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .bubble {
          position: absolute;
          bottom: -200px;
          border-radius: 50%;
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          animation: floatUp linear infinite;
          will-change: transform, opacity;
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% {
            transform: translateY(-120vh) scale(1.3);
            opacity: 0;
          }
        }

        /* ================= CONTENT WRAPPER ================= */
        .about-content {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* ==========================================================
           HERO SECTION — Compact
           ========================================================== */
        .hero-section {
          text-align: center;
          margin-bottom: 28px;           /* ✅ Reduced margin */
          animation: fadeUp 0.8s ease-out;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(26, 35, 126, 0.08);
          border: 1px solid rgba(26, 35, 126, 0.15);
          color: #1a237e;
          padding: 7px 16px;
          border-radius: 24px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 18px;          /* ✅ Reduced */
        }

        .hero-badge-icon {
          color: #f57c00;
          font-size: 10px;
        }

        .hero-title {
          font-size: 42px;               /* ✅ Reduced from 48px */
          font-weight: 800;
          color: #1a237e;
          margin: 0 0 14px 0;
          letter-spacing: -1px;
          line-height: 1.15;
        }

        .hero-title-gradient {
          background: linear-gradient(135deg, #f57c00 0%, #ff9800 50%, #f57c00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
          animation: gradientShift 4s ease infinite;
          background-size: 200% 200%;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-description {
          font-size: 16px;               /* ✅ Reduced */
          color: #666;
          font-weight: 500;
          max-width: 650px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ==========================================================
           OUR STORY CARD
           ========================================================== */
        .story-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 38px 42px;            /* ✅ Reduced padding */
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow:
            0 20px 60px rgba(26, 35, 126, 0.08),
            0 4px 12px rgba(0, 0, 0, 0.03);
          margin-bottom: 35px;           /* ✅ Reduced */
          position: relative;
          overflow: hidden;
          animation: fadeUp 0.8s ease-out 0.15s backwards;
        }

        .story-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #1a237e, #f57c00, #1a237e);
          background-size: 200% 100%;
          animation: gradientShift 4s ease infinite;
        }

        .story-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .story-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 8px 20px rgba(26, 35, 126, 0.25);
          flex-shrink: 0;
        }

        .story-title {
          font-size: 24px;
          font-weight: 800;
          color: #1a237e;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .story-text {
          font-size: 15px;
          color: #555;
          font-weight: 500;
          line-height: 1.8;
          margin: 0 0 16px 0;
        }

        .story-text:last-child {
          margin-bottom: 0;
        }

        /* ==========================================================
           ✅ BOOK DIVIDER — Below Our Story
           ========================================================== */
        .book-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 40px 0;                /* ✅ Space above and below */
          animation: fadeUp 0.8s ease-out 0.2s backwards;
        }

        .book-divider-line {
          height: 1.5px;
          width: 100px;
          background: linear-gradient(90deg, transparent 0%, #f57c00 100%);
          border-radius: 2px;
        }

        .book-divider-line:last-child {
          background: linear-gradient(90deg, #f57c00 0%, transparent 100%);
        }

        .book-divider-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f57c00 0%, #ff9800 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          box-shadow: 0 8px 24px rgba(245, 124, 0, 0.35);
          flex-shrink: 0;
        }

        /* ==========================================================
           SECTION HEADER
           ========================================================== */
        .section-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 32px;
          font-weight: 800;
          color: #1a237e;
          margin: 0 0 8px 0;
          letter-spacing: -0.8px;
        }

        .section-title-gradient {
          background: linear-gradient(135deg, #f57c00 0%, #ff9800 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-subtitle {
          font-size: 14.5px;
          color: #888;
          font-weight: 500;
          margin: 0;
        }

        /* ==========================================================
           FEATURES GRID
           ========================================================== */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 50px;
        }

        .feature-card {
          background: #fff;
          padding: 30px 22px 24px;
          border-radius: 18px;
          border: 1px solid rgba(26, 35, 126, 0.06);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          text-align: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          animation: fadeUp 0.8s ease-out backwards;
        }

        .feature-card:nth-child(1) { animation-delay: 0.2s; }
        .feature-card:nth-child(2) { animation-delay: 0.25s; }
        .feature-card:nth-child(3) { animation-delay: 0.3s; }
        .feature-card:nth-child(4) { animation-delay: 0.35s; }
        .feature-card:nth-child(5) { animation-delay: 0.4s; }
        .feature-card:nth-child(6) { animation-delay: 0.45s; }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(26, 35, 126, 0.12);
          border-color: rgba(26, 35, 126, 0.1);
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          margin: 0 auto 16px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(-6deg);
        }

        .feature-title {
          font-size: 16.5px;
          font-weight: 800;
          color: #1a237e;
          margin: 0 0 8px 0;
          letter-spacing: -0.3px;
        }

        .feature-desc {
          font-size: 13px;
          color: #777;
          font-weight: 500;
          line-height: 1.6;
          margin: 0;
        }

        .feature-underline {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          border-radius: 3px 3px 0 0;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover .feature-underline {
          width: 60%;
        }

        /* ==========================================================
           ✅ STATS SECTION — Light Theme
           ========================================================== */
        .stats-section {
          margin-bottom: 50px;
          padding: 45px 40px;
          background: linear-gradient(180deg, #fafaf8 0%, #ffffff 100%);
          border-radius: 24px;
          border: 1px solid rgba(26, 35, 126, 0.06);
          box-shadow: 0 8px 32px rgba(26, 35, 126, 0.05);
          position: relative;
          overflow: hidden;
          animation: fadeUp 0.8s ease-out 0.3s backwards;
        }

        .stats-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #f57c00, #1a237e, #f57c00);
          background-size: 200% 100%;
          animation: gradientShift 4s ease infinite;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-top: 30px;
        }

        .stat-card {
          position: relative;
          text-align: center;
          padding: 28px 16px 22px;
          border-radius: 16px;
          background: #fff;
          border: 1px solid #f0f0f0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(26, 35, 126, 0.1);
          border-color: rgba(26, 35, 126, 0.1);
        }

        .stat-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
          transition: all 0.35s ease;
        }

        .stat-icon-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          transition: all 0.35s ease;
        }

        .stat-card:hover .stat-icon-wrap {
          transform: scale(1.1);
        }

        .stat-card:hover .stat-icon-dot {
          transform: scale(1.3);
        }

        .stat-number {
          font-size: 30px;
          font-weight: 800;
          margin-bottom: 6px;
          line-height: 1.1;
          letter-spacing: -0.8px;
          transition: all 0.3s ease;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1.2px;
        }

        .stat-underline {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          border-radius: 3px 3px 0 0;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover .stat-underline {
          width: 50%;
        }

        /* ==========================================================
           CTA CARD
           ========================================================== */
        .cta-card {
          text-align: center;
          padding: 50px 30px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 20px 60px rgba(26, 35, 126, 0.08);
          animation: fadeUp 0.8s ease-out 0.4s backwards;
        }

        .cta-title {
          font-size: 30px;
          font-weight: 800;
          color: #1a237e;
          margin: 0 0 10px 0;
          letter-spacing: -0.8px;
        }

        .cta-text {
          font-size: 15px;
          color: #666;
          font-weight: 500;
          margin: 0 0 26px 0;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
          color: #fff;
          padding: 15px 36px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.5px;
          text-decoration: none;
          box-shadow: 0 12px 28px rgba(245, 124, 0, 0.4);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 40px rgba(245, 124, 0, 0.5);
        }

        .cta-button-icon {
          font-size: 13px;
          transition: transform 0.3s ease;
        }

        .cta-button:hover .cta-button-icon {
          transform: translateX(5px);
        }

        /* ==========================================================
           FADE UP ANIMATION
           ========================================================== */
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ==========================================================
           RESPONSIVE
           ========================================================== */

        @media (max-width: 1024px) {
          .hero-title {
            font-size: 36px;
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
        }

        @media (max-width: 768px) {
          .about-page {
            padding: 30px 16px 40px;
          }
          .hero-section {
            margin-bottom: 22px;
          }
          .hero-title {
            font-size: 28px;
            letter-spacing: -0.6px;
          }
          .hero-description {
            font-size: 14px;
          }
          .hero-badge {
            font-size: 10px;
            padding: 6px 12px;
          }

          .story-card {
            padding: 24px 20px;
            border-radius: 18px;
            margin-bottom: 28px;
          }
          .story-title {
            font-size: 20px;
          }
          .story-text {
            font-size: 13.5px;
          }
          .story-icon {
            width: 38px;
            height: 38px;
            font-size: 15px;
          }

          .book-divider {
            margin: 30px 0;
            gap: 12px;
          }
          .book-divider-line {
            width: 60px;
          }
          .book-divider-icon {
            width: 38px;
            height: 38px;
            font-size: 14px;
          }

          .section-title {
            font-size: 24px;
          }
          .section-subtitle {
            font-size: 13px;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 14px;
            margin-bottom: 40px;
          }
          .feature-card {
            padding: 24px 18px 20px;
            border-radius: 16px;
          }
          .feature-icon {
            width: 52px;
            height: 52px;
            font-size: 20px;
            margin-bottom: 14px;
          }
          .feature-title {
            font-size: 15.5px;
          }

          .stats-section {
            padding: 32px 18px;
            border-radius: 18px;
            margin-bottom: 40px;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-top: 22px;
          }
          .stat-card {
            padding: 22px 12px 18px;
          }
          .stat-number {
            font-size: 22px;
          }
          .stat-label {
            font-size: 9.5px;
            letter-spacing: 0.8px;
          }
          .stat-icon-wrap {
            width: 36px;
            height: 36px;
            margin-bottom: 10px;
          }
          .stat-icon-dot {
            width: 12px;
            height: 12px;
          }

          .cta-card {
            padding: 36px 20px;
            border-radius: 18px;
          }
          .cta-title {
            font-size: 22px;
          }
          .cta-text {
            font-size: 13.5px;
          }
          .cta-button {
            padding: 13px 28px;
            font-size: 13.5px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 24px;
          }
          .hero-description {
            font-size: 13px;
            line-height: 1.6;
          }
          .story-card {
            padding: 20px 16px;
          }
          .story-title {
            font-size: 18px;
          }
          .story-text {
            font-size: 13px;
            line-height: 1.7;
          }

          .section-title {
            font-size: 20px;
          }

          .stats-section {
            padding: 26px 14px;
          }
          .stat-number {
            font-size: 20px;
          }
          .stat-label {
            font-size: 9px;
          }

          .cta-title {
            font-size: 20px;
          }
          .cta-button {
            padding: 12px 24px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default About;