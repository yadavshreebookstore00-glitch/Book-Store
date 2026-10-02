import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowRight,
  FaHeart,
  FaBookOpen,
} from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Decorative glow */}
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.container}>
        {/* ===== Column 1: Brand ===== */}
        <div className={styles.column}>
          <Link to="/" className={styles.brandLink}>
            <img
              src="/logo.png"
              alt="Yadav Shree Book Store"
              className={styles.brandLogo}
            />
           
          </Link>

          <p className={styles.brandDesc}>
            Your one-stop online bookstore for all age groups. Discover,
            read, and grow with thousands of books.
          </p>

          {/* Trust Badge */}
          <div className={styles.trustBadge}>
            <FaBookOpen className={styles.trustIcon} />
            <span>10,000+ Happy Readers</span>
          </div>

          {/* Social Icons */}
          <div className={styles.socialGroup}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="https://wa.me/917067974442"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* ===== Column 2: Quick Links ===== */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Quick Links</h3>
          <ul className={styles.linkList}>
            <li>
              <Link to="/" className={styles.footerLink}>
                <FaArrowRight className={styles.linkIcon} />
                Home
              </Link>
            </li>
            <li>
              <Link to="/shop" className={styles.footerLink}>
                <FaArrowRight className={styles.linkIcon} />
                Shop
              </Link>
            </li>
            <li>
              <Link to="/categories" className={styles.footerLink}>
                <FaArrowRight className={styles.linkIcon} />
                Categories
              </Link>
            </li>
            <li>
              <Link to="/about" className={styles.footerLink}>
                <FaArrowRight className={styles.linkIcon} />
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className={styles.footerLink}>
                <FaArrowRight className={styles.linkIcon} />
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* ===== Column 3: Customer Service ===== */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Customer Service</h3>
          <ul className={styles.linkList}>
            <li>
              <Link to="/profile" className={styles.footerLink}>
                <FaArrowRight className={styles.linkIcon} />
                My Account
              </Link>
            </li>
            <li>
              <Link to="/orders" className={styles.footerLink}>
                <FaArrowRight className={styles.linkIcon} />
                Track Order
              </Link>
            </li>
            <li>
              <Link to="/cart" className={styles.footerLink}>
                <FaArrowRight className={styles.linkIcon} />
                Cart
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className={styles.footerLink}>
                <FaArrowRight className={styles.linkIcon} />
                Wishlist
              </Link>
            </li>
          </ul>
        </div>

        {/* ===== Column 4: Contact ===== */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Get In Touch</h3>

          <div className={styles.contactList}>
            {/* Address */}
            <div className={styles.contactRow}>
              <div className={styles.contactIconWrap}>
                <FaMapMarkerAlt />
              </div>
              <div className={styles.contactContent}>
                <span className={styles.contactLabel}>Visit Us</span>
                <span className={styles.contactValue}>
                  63, 64, Bholaram Ustad Marg,
                  <br />
                  Pipliya Rao, Ring Road,
                  <br />
                  Indore - 452014
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className={styles.contactRow}>
              <div className={styles.contactIconWrap}>
                <FaPhoneAlt />
              </div>
              <div className={styles.contactContent}>
                <span className={styles.contactLabel}>Call Us</span>
                <a
                  href="tel:+917067974442"
                  className={styles.contactValue}
                >
                  +91 70679 74442
                </a>
              </div>
            </div>

            {/* Email */}
            <div className={styles.contactRow}>
              <div className={styles.contactIconWrap}>
                <FaEnvelope />
              </div>
              <div className={styles.contactContent}>
                <span className={styles.contactLabel}>Email Us</span>
                <a
                  href="mailto:yadavshreebookstore@gmail.com"
                  className={styles.contactValue}
                >
                  yadavshreebookstore@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyright}>
            © {currentYear} <strong>Yadav Shree Book Store</strong>. All Rights Reserved.
          </p>
          <p className={styles.madeWith}>
            Made with <FaHeart className={styles.heartIcon} /> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;