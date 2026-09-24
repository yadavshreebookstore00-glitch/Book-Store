import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* ===== Column 1: Brand ===== */}
        <div className={styles.column}>
          <h3>Yadav Shree</h3>
          <p>Your one-stop online bookstore for all age groups.</p>

          {/* Social Icons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={socialIconStyle}
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              style={socialIconStyle}
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={socialIconStyle}
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              style={socialIconStyle}
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* ===== Column 2: Quick Links ===== */}
        <div className={styles.column}>
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/categories">Categories</Link>
          {/* ✅ NAYA */}
          <Link to="/about">About Us</Link>
          {/* ✅ NAYA */}
          <Link to="/contact">Contact</Link>
        </div>

        {/* ===== Column 3: Customer Service ===== */}
        <div className={styles.column}>
          <h3>Customer Service</h3>
          <Link to="/profile">My Account</Link>
          <Link to="/orders">Track Order</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/wishlist">Wishlist</Link>
        </div>

        {/* ===== Column 4: Contact Us ===== */}
        <div className={styles.column}>
          <h3>Contact Us</h3>
          <p style={contactRowStyle}>
            <FaMapMarkerAlt style={iconStyle} />
            Raipur, Chhattisgarh, India
          </p>
          <p style={contactRowStyle}>
            <FaEnvelope style={iconStyle} />
            support@yadavshree.com
          </p>
          <p style={contactRowStyle}>
            <FaPhone style={iconStyle} />
            +91 98765 43210
          </p>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className={styles.bottom}>
        © 2026 Yadav Shree Book Store. All Rights Reserved.
      </div>
    </footer>
  );
};

// ===== Inline Styles =====
const socialIconStyle = {
  width: '34px',
  height: '34px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  transition: 'all 0.3s',
  textDecoration: 'none',
};

const contactRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  color: '#d0d0d0',
  marginBottom: '10px',
  fontWeight: 500,
};

const iconStyle = {
  color: '#f57c00',
  fontSize: '14px',
  flexShrink: 0,
};

export default Footer;