import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaTruck, FaUndo, FaHeadset, FaUsers, FaAward } from 'react-icons/fa';

const About = () => {
  return (
    <div style={{ padding: '60px 20px', background: '#f9f9f9' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ===== Hero Section ===== */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{
            color: '#1a237e',
            fontWeight: 800,
            fontSize: '42px',
            marginBottom: '15px',
            letterSpacing: '-0.5px'
          }}>
            About Yadav Shree Book Store
          </h1>
          <p style={{
            color: '#666',
            fontSize: '17px',
            fontWeight: 500,
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.7
          }}>
            Your one-stop destination for books of all genres — from timeless classics
            to modern bestsellers. We believe in the power of reading and its ability
            to transform lives.
          </p>
        </div>

        {/* ===== Our Story ===== */}
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          marginBottom: '40px'
        }}>
          <h2 style={{
            color: '#1a237e',
            fontWeight: 800,
            fontSize: '26px',
            marginBottom: '20px'
          }}>
            📖 Our Story
          </h2>
          <p style={{
            color: '#555',
            fontSize: '15px',
            fontWeight: 500,
            lineHeight: 1.8,
            marginBottom: '15px'
          }}>
            Yadav Shree Book Store started with a simple mission: to make books
            accessible to everyone, everywhere. What began as a small collection
            of hand-picked titles has grown into a comprehensive online bookstore
            serving thousands of readers across India.
          </p>
          <p style={{
            color: '#555',
            fontSize: '15px',
            fontWeight: 500,
            lineHeight: 1.8
          }}>
            We carefully curate our collection to include books across all categories
            — Fiction, Non-Fiction, Self Help, Business, Biography, Children's books,
            and more. Whether you're a casual reader or an avid bibliophile, we have
            something for you.
          </p>
        </div>

        {/* ===== Why Choose Us ===== */}
        <h2 style={{
          color: '#1a237e',
          fontWeight: 800,
          fontSize: '26px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          Why Choose Us?
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <FeatureCard
            icon={<FaBook />}
            title="Huge Collection"
            desc="Over 10,000+ books across all genres and categories."
            color="#1a237e"
          />
          <FeatureCard
            icon={<FaTruck />}
            title="Fast Delivery"
            desc="Quick and reliable shipping across India."
            color="#f57c00"
          />
          <FeatureCard
            icon={<FaUndo />}
            title="Easy Returns"
            desc="7-day hassle-free return policy on all orders."
            color="#2e7d32"
          />
          <FeatureCard
            icon={<FaHeadset />}
            title="24/7 Support"
            desc="Our team is always here to help you out."
            color="#c62828"
          />
          <FeatureCard
            icon={<FaUsers />}
            title="Trusted by Readers"
            desc="10,000+ happy customers and growing every day."
            color="#6a1b9a"
          />
          <FeatureCard
            icon={<FaAward />}
            title="Best Prices"
            desc="Competitive prices with regular discounts."
            color="#0277bd"
          />
        </div>

        {/* ===== Stats ===== */}
        <div style={{
          background: '#1a237e',
          borderRadius: '12px',
          padding: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '30px',
          color: '#fff',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <StatItem number="10,000+" label="Books Available" />
          <StatItem number="50,000+" label="Happy Customers" />
          <StatItem number="500+" label="Authors" />
          <StatItem number="4.8★" label="Average Rating" />
        </div>

        {/* ===== CTA ===== */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{
            color: '#1a237e',
            fontWeight: 800,
            fontSize: '22px',
            marginBottom: '15px'
          }}>
            Ready to start reading?
          </h3>
          <p style={{
            color: '#666',
            fontSize: '15px',
            fontWeight: 500,
            marginBottom: '25px'
          }}>
            Explore our collection and find your next favorite book.
          </p>
          <Link
            to="/shop"
            style={{
              display: 'inline-block',
              background: '#f57c00',
              color: '#fff',
              padding: '14px 35px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '0.5px'
            }}
          >
            Browse Books →
          </Link>
        </div>

      </div>
    </div>
  );
};

// ===== Feature Card Component =====
const FeatureCard = ({ icon, title, desc, color }) => (
  <div style={{
    background: '#fff',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    textAlign: 'center',
    transition: 'transform 0.3s'
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: `${color}15`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      margin: '0 auto 15px'
    }}>
      {icon}
    </div>
    <h3 style={{
      color: '#1a237e',
      fontWeight: 700,
      fontSize: '17px',
      marginBottom: '8px'
    }}>
      {title}
    </h3>
    <p style={{
      color: '#666',
      fontSize: '13px',
      fontWeight: 500,
      lineHeight: 1.6
    }}>
      {desc}
    </p>
  </div>
);

// ===== Stat Item =====
const StatItem = ({ number, label }) => (
  <div>
    <h3 style={{
      fontSize: '32px',
      fontWeight: 800,
      color: '#f57c00',
      marginBottom: '5px'
    }}>
      {number}
    </h3>
    <p style={{
      fontSize: '13px',
      fontWeight: 600,
      color: '#c5cae9',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      {label}
    </p>
  </div>
);

export default About;