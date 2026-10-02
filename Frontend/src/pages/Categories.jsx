import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBook,
  FaBookOpen,
  FaLightbulb,
  FaBriefcase,
  FaUserTie,
  FaGraduationCap,
  FaChild,
  FaPalette,
  FaHeart,
  FaSearch,
  FaArrowRight,
  FaLayerGroup,
} from 'react-icons/fa';
import api from '../services/api';
import Banner from '../components/common/Banner';

// ✅ Category Config
const categoryConfig = [
  {
    name: 'Fiction',
    Icon: FaBookOpen,
    color: '#1a237e',
    gradient: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
    description: 'Stories & Novels',
    image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
  },
  {
    name: 'Non-Fiction',
    Icon: FaBook,
    color: '#f57c00',
    gradient: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
    description: 'Real World Reads',
    image:
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80',
  },
  {
    name: 'Self Help',
    Icon: FaLightbulb,
    color: '#2e7d32',
    gradient: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
    description: 'Grow Yourself',
    image:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80',
  },
  {
    name: 'Business',
    Icon: FaBriefcase,
    color: '#c62828',
    gradient: 'linear-gradient(135deg, #c62828 0%, #e53935 100%)',
    description: 'Money & Markets',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&q=80',
  },
  {
    name: 'Biography',
    Icon: FaUserTie,
    color: '#6a1b9a',
    gradient: 'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%)',
    description: 'Life Stories',
    image:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80',
  },
  {
    name: 'Academic',
    Icon: FaGraduationCap,
    color: '#0277bd',
    gradient: 'linear-gradient(135deg, #0277bd 0%, #039be5 100%)',
    description: 'Study Materials',
    image:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80',
  },
  {
    name: 'Children',
    Icon: FaChild,
    color: '#ef6c00',
    gradient: 'linear-gradient(135deg, #ef6c00 0%, #fb8c00 100%)',
    description: 'Kids Collection',
    image:
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&q=80',
  },
  {
    name: 'Comics',
    Icon: FaPalette,
    color: '#00838f',
    gradient: 'linear-gradient(135deg, #00838f 0%, #00acc1 100%)',
    description: 'Visual Stories',
    image:
      'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=500&q=80',
  },
  {
    name: 'Romance',
    Icon: FaHeart,
    color: '#d81b60',
    gradient: 'linear-gradient(135deg, #d81b60 0%, #ec407a 100%)',
    description: 'Love & Feelings',
    image:
      'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=500&q=80',
  },
  {
    name: 'Mystery',
    Icon: FaSearch,
    color: '#455a64',
    gradient: 'linear-gradient(135deg, #455a64 0%, #607d8b 100%)',
    description: 'Thrill & Suspense',
    image:
      'https://images.unsplash.com/photo-1587876931567-564ce588bfbd?w=500&q=80',
  },
];

const Categories = () => {
  const [bookCounts, setBookCounts] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);

  // ===== Fetch book counts =====
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data } = await api.get('/books?limit=1000');
        const books = data.books || [];

        const counts = {};
        books.forEach((book) => {
          if (book.category) {
            counts[book.category] = (counts[book.category] || 0) + 1;
          }
        });
        setBookCounts(counts);
      } catch (err) {
        console.error('Failed to fetch book counts:', err);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <Banner placement="categories" />

      {/* ===== Page Container ===== */}
      <div className="cat-page">
        {/* ===== Header ===== */}
        <div className="cat-header">
          <div className="cat-header-left">
            <div className="cat-header-icon">
              <FaLayerGroup />
            </div>
            <div>
              <h1 className="cat-title">Browse Categories</h1>
              <p className="cat-subtitle">
                Explore books across all genres
              </p>
            </div>
          </div>

          <Link to="/shop" className="cat-view-all">
            View All Books <FaArrowRight className="cat-view-all-icon" />
          </Link>
        </div>

        {/* ===== Categories Grid ===== */}
        <div className="cat-grid">
          {categoryConfig.map((cat) => {
            const Icon = cat.Icon;
            const count = bookCounts[cat.name] || 0;
            const isHovered = hoveredCard === cat.name;

            return (
              <Link
                key={cat.name}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="cat-link"
                onMouseEnter={() => setHoveredCard(cat.name)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`cat-card ${
                    isHovered ? 'cat-card-hovered' : ''
                  }`}
                  style={{
                    boxShadow: isHovered
                      ? `0 20px 40px ${cat.color}30, 0 0 0 2px ${cat.color}40`
                      : '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Background Image */}
                  <div
                    className="cat-bg"
                    style={{
                      backgroundImage: `url(${cat.image})`,
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div
                    className="cat-overlay"
                    style={{
                      background: isHovered
                        ? `linear-gradient(180deg, ${cat.color}15 0%, ${cat.color}40 40%, rgba(0,0,0,0.92) 100%)`
                        : 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.92) 100%)',
                    }}
                  />

                  {/* Content */}
                  <div className="cat-content">
                    {/* Top: Small Icon */}
                    <div className="cat-top">
                      <div
                        className="cat-icon"
                        style={{
                          background: isHovered
                            ? cat.gradient
                            : 'rgba(255, 255, 255, 0.15)',
                          boxShadow: isHovered
                            ? `0 6px 16px ${cat.color}60`
                            : 'none',
                        }}
                      >
                        <Icon />
                      </div>
                    </div>

                    {/* Bottom: Compact Content */}
                    <div className="cat-bottom">
                      <h3 className="cat-name">{cat.name}</h3>
                      <p className="cat-desc">{cat.description}</p>

                      {/* Bottom Row: Count + Arrow */}
                      <div className="cat-bottom-row">
                        {count > 0 ? (
                          <span
                            className="cat-count"
                            style={{
                              background: isHovered
                                ? cat.gradient
                                : 'rgba(255,255,255,0.15)',
                            }}
                          >
                            {count} {count === 1 ? 'Book' : 'Books'}
                          </span>
                        ) : (
                          <span className="cat-count cat-count-empty">
                            Explore
                          </span>
                        )}

                        <div
                          className="cat-arrow"
                          style={{
                            background: isHovered
                              ? '#fff'
                              : 'rgba(255,255,255,0.15)',
                            color: isHovered ? cat.color : '#fff',
                            transform: isHovered
                              ? 'rotate(-45deg) scale(1.1)'
                              : 'rotate(0) scale(1)',
                          }}
                        >
                          <FaArrowRight />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ==========================================================
          CSS
          ========================================================== */}
      <style>{`
        /* ================= PAGE ================= */
        .cat-page {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        /* ================= HEADER ================= */
        .cat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .cat-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .cat-header-icon {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          box-shadow: 0 8px 20px rgba(26, 35, 126, 0.25);
        }

        .cat-title {
          color: #1a237e;
          font-weight: 800;
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .cat-subtitle {
          color: #666;
          font-weight: 500;
          margin: 4px 0 0 0;
          font-size: 14px;
        }

        .cat-view-all {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: #1a237e;
          border: 2px solid #1a237e;
          padding: 11px 22px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .cat-view-all:hover {
          background: #1a237e;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26, 35, 126, 0.3);
        }

        .cat-view-all-icon {
          font-size: 11px;
          transition: transform 0.3s ease;
        }

        .cat-view-all:hover .cat-view-all-icon {
          transform: translateX(3px);
        }

        /* ================= GRID ================= */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
          width: 100%;
        }

        /* ================= LINK ================= */
        .cat-link {
          text-decoration: none;
          color: inherit;
          display: block;
          min-width: 0;
        }

        /* ==========================================================
           ✅ CARD — Portrait Shape (taller than wide)
           ========================================================== */
        .cat-card {
          position: relative;
          height: 280px;              /* ✅ Taller than wide */
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
          isolation: isolate;
        }

        .cat-card-hovered {
          transform: translateY(-8px) scale(1.02);
        }

        /* ================= BACKGROUND ================= */
        .cat-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }

        .cat-card-hovered .cat-bg {
          transform: scale(1.15);
        }

        /* ================= OVERLAY ================= */
        .cat-overlay {
          position: absolute;
          inset: 0;
          transition: background 0.4s ease;
          z-index: 1;
        }

        /* ================= CONTENT ================= */
        .cat-content {
          position: relative;
          height: 100%;
          padding: 12px 14px 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #fff;
          z-index: 2;
        }

        /* ================= TOP ================= */
        .cat-top {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
        }

        /* ✅ Smaller Icon */
        .cat-icon {
          width: 36px;                /* ✅ 46 → 36 (chhota) */
          height: 36px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;            /* ✅ 20 → 15 (chhota) */
          flex-shrink: 0;
          transition: all 0.35s ease;
        }

        /* ================= BOTTOM (Compact) ================= */
        .cat-bottom {
          display: flex;
          flex-direction: column;
          gap: 2px;                    /* ✅ Chhota gap */
        }

        .cat-name {
          font-size: 15px;             /* ✅ 17 → 15 */
          font-weight: 800;
          margin: 0;
          color: #fff;
          letter-spacing: -0.3px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
          line-height: 1.15;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cat-desc {
          font-size: 10.5px;           /* ✅ 11.5 → 10.5 */
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          margin: 0 0 8px 0;           /* ✅ Bottom margin */
          line-height: 1.3;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cat-bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }

        /* ✅ Smaller Count Badge */
        .cat-count {
          display: inline-block;
          padding: 3px 8px;            /* ✅ Chhota */
          border-radius: 14px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 9.5px;            /* ✅ 10.5 → 9.5 */
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.2px;
          transition: background 0.35s ease;
          white-space: nowrap;
        }

        .cat-count-empty {
          background: rgba(255, 255, 255, 0.15);
          opacity: 0.9;
        }

        /* ✅ Smaller Arrow */
        .cat-arrow {
          width: 24px;                 /* ✅ 28 → 24 */
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;             /* ✅ 11 → 10 */
          flex-shrink: 0;
          transition: all 0.35s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        /* ==========================================================
           RESPONSIVE
           ========================================================== */

        @media (max-width: 1280px) {
          .cat-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
          }
        }

        @media (max-width: 1024px) {
          .cat-page {
            padding: 30px 16px;
          }
          .cat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }
          .cat-card {
            height: 260px;             /* ✅ Thoda chhota */
          }
          .cat-title {
            font-size: 24px;
          }
          .cat-header-icon {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }
        }

        @media (max-width: 768px) {
          .cat-page {
            padding: 24px 14px;
          }
          .cat-header {
            margin-bottom: 22px;
            gap: 12px;
          }
          .cat-header-icon {
            width: 44px;
            height: 44px;
            font-size: 18px;
            border-radius: 12px;
          }
          .cat-title {
            font-size: 20px;
          }
          .cat-subtitle {
            font-size: 12.5px;
          }
          .cat-view-all {
            padding: 9px 16px;
            font-size: 12px;
          }
          .cat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .cat-card {
            height: 240px;             /* ✅ Mobile pe chhota */
            border-radius: 16px;
          }
          .cat-content {
            padding: 12px;
          }
          .cat-icon {
            width: 34px;
            height: 34px;
            font-size: 14px;
          }
          .cat-name {
            font-size: 14px;
          }
          .cat-desc {
            font-size: 10px;
            margin-bottom: 6px;
          }
        }

        @media (max-width: 480px) {
          .cat-page {
            padding: 20px 12px;
          }
          .cat-header {
            align-items: flex-start;
          }
          .cat-header-icon {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
          .cat-title {
            font-size: 18px;
          }
          .cat-subtitle {
            font-size: 11.5px;
          }
          .cat-view-all {
            padding: 8px 14px;
            font-size: 11.5px;
          }
          .cat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
          .cat-card {
            height: 220px;             /* ✅ Mobile compact */
            border-radius: 14px;
          }
          .cat-content {
            padding: 10px 12px;
          }
          .cat-icon {
            width: 32px;
            height: 32px;
            font-size: 13px;
            border-radius: 9px;
          }
          .cat-name {
            font-size: 13px;
          }
          .cat-desc {
            font-size: 9.5px;
            margin-bottom: 5px;
          }
          .cat-count {
            font-size: 9px;
            padding: 2px 7px;
          }
          .cat-arrow {
            width: 22px;
            height: 22px;
            font-size: 9px;
          }
        }

        @media (max-width: 360px) {
          .cat-grid {
            gap: 8px;
          }
          .cat-card {
            height: 200px;
          }
          .cat-name {
            font-size: 12.5px;
          }
          .cat-desc {
            font-size: 9px;
          }
        }
      `}</style>
    </div>
  );
};

export default Categories;