import React from 'react';
import { Link } from 'react-router-dom';
import Banner from '../components/common/Banner';

const categories = [
  { name: 'Fiction', icon: '📖', color: '#1a237e' },
  { name: 'Non-Fiction', icon: '📚', color: '#f57c00' },
  { name: 'Self Help', icon: '🌟', color: '#2e7d32' },
  { name: 'Business', icon: '💼', color: '#c62828' },
  { name: 'Biography', icon: '👤', color: '#6a1b9a' },
  { name: 'Academic', icon: '🎓', color: '#0277bd' },
  { name: 'Children', icon: '🧒', color: '#ef6c00' },
  { name: 'Comics', icon: '🎨', color: '#00838f' },
  { name: 'Romance', icon: '💖', color: '#d81b60' },
  { name: 'Mystery', icon: '🔍', color: '#455a64' },
];

const Categories = () => {
  return (
    <div>
      <Banner placement="categories" />

      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#1a237e', fontWeight: 800, marginBottom: '10px', fontSize: '28px' }}>
          Browse Categories
        </h1>
        <p style={{ color: '#666', fontWeight: 500, marginBottom: '35px' }}>
          Explore books across all genres
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  background: '#fff',
                  padding: '30px 20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  borderTop: `4px solid ${cat.color}`,
                  transition: 'transform 0.3s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{cat.icon}</div>
                <h3 style={{ color: '#1a237e', fontWeight: 700, fontSize: '16px' }}>
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;