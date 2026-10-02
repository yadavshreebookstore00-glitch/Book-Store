import React, { useState } from 'react';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import api from '../services/api';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post('/contacts', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim() || 'General Inquiry',
        message: form.message.trim(),
      });

      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });

      // Hide success message after 6 seconds
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      console.error('Contact submit error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to send message. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-content">
        {/* ===== Header ===== */}
        <div className="contact-header">
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">
            Have a question, feedback, or just want to say hi? We'd love to
            hear from you.
          </p>
        </div>

        {/* ===== Info Cards ===== */}
        <div className="info-grid">
          <InfoCard
            icon={<FaMapMarkerAlt />}
            title="Visit Us"
            lines={[
              '63, 64, Bholaram Ustad Marg',
              'Pipliya Rao, Ring Road',
              'Indore - 452014',
            ]}
            color="#1a237e"
          />
          <InfoCard
            icon={<FaPhone />}
            title="Call Us"
            lines={['+91 70679 74442', 'Mon-Sat, 10am-8pm']}
            color="#f57c00"
          />
          <InfoCard
            icon={<FaEnvelope />}
            title="Email Us"
            lines={['yadavshreebookstore@gmail.com', 'Reply within 24hrs']}
            color="#2e7d32"
          />
          <InfoCard
            icon={<FaClock />}
            title="Working Hours"
            lines={['Mon-Fri: 9am-9pm', 'Sat: 10am-8pm', 'Sun: Closed']}
            color="#c62828"
          />
        </div>

        {/* ===== Form + Side Info ===== */}
        <div className="form-layout">
          {/* ===== FORM ===== */}
          <div className="form-card">
            <h2 className="form-title">Send us a Message</h2>

            {/* Success Message */}
            {submitted && (
              <div className="success-box">
                <FaCheckCircle className="success-icon" />
                <div>
                  <strong>Thank you!</strong>
                  <p>We'll get back to you soon.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-box">
                <FaExclamationTriangle className="error-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Your Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="e.g., Order Inquiry"
                    value={form.subject}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Your Message *</label>
                <textarea
                  name="message"
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ===== Side Info ===== */}
          <div className="side-info">
            <div className="side-card">
              <h3 className="side-title">Follow Us</h3>
              <div className="social-group">
                <SocialBtn icon={<FaFacebookF />} color="#1877f2" />
                <SocialBtn icon={<FaTwitter />} color="#1da1f2" />
                <SocialBtn icon={<FaInstagram />} color="#e4405f" />
                <SocialBtn icon={<FaLinkedinIn />} color="#0077b5" />
              </div>
            </div>

            <div className="help-card">
              <h3 className="help-title">Need Help Fast?</h3>
              <p className="help-text">
                Call us directly for urgent inquiries. Our team is available
                during working hours.
              </p>
              <a href="tel:+917067974442" className="help-phone">
                <FaPhone />
                +91 70679 74442
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CSS ===== */}
      <style>{`
        .contact-page {
          padding: 60px 20px;
          background: linear-gradient(180deg, #f8f7f4 0%, #ffffff 100%);
          min-height: 100vh;
        }

        .contact-content {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* ===== Header ===== */
        .contact-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .contact-title {
          color: #1a237e;
          font-weight: 800;
          font-size: 42px;
          margin: 0 0 15px 0;
          letter-spacing: -1px;
        }

        .contact-subtitle {
          color: #666;
          font-size: 17px;
          font-weight: 500;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ===== Info Grid ===== */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 40px;
        }

        /* ===== Form Layout ===== */
        .form-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 25px;
          align-items: start;
        }

        /* ===== Form Card ===== */
        .form-card {
          background: #fff;
          padding: 35px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(26, 35, 126, 0.08);
          border: 1px solid #f0f0f0;
        }

        .form-title {
          color: #1a237e;
          font-weight: 800;
          font-size: 22px;
          margin: 0 0 25px 0;
          letter-spacing: -0.5px;
        }

        /* Success Box */
        .success-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #e8f5e9;
          color: #2e7d32;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 22px;
          border-left: 4px solid #2e7d32;
        }

        .success-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .success-box strong {
          font-weight: 800;
          font-size: 14px;
          display: block;
        }

        .success-box p {
          margin: 2px 0 0 0;
          font-size: 13px;
          font-weight: 500;
        }

        /* Error Box */
        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffebee;
          color: #c62828;
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 22px;
          border-left: 4px solid #c62828;
          font-size: 13px;
          font-weight: 600;
        }

        .error-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        /* ===== Form ===== */
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 700;
          color: #1a237e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 15px;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          outline: none;
          font-family: inherit;
          background: #fff;
          transition: all 0.25s ease;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #aaa;
          font-weight: 500;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #1a237e;
          box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.08);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        /* ===== Submit Button ===== */
        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
          color: #fff;
          border: none;
          padding: 15px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          margin-top: 4px;
          box-shadow: 0 8px 24px rgba(26, 35, 126, 0.25);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(26, 35, 126, 0.35);
          background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ===== Side Info ===== */
        .side-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .side-card {
          background: #fff;
          padding: 28px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(26, 35, 126, 0.08);
          border: 1px solid #f0f0f0;
        }

        .side-title {
          color: #1a237e;
          font-weight: 800;
          font-size: 17px;
          margin: 0 0 18px 0;
        }

        .social-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .help-card {
          background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
          padding: 28px;
          border-radius: 20px;
          color: #fff;
          box-shadow: 0 10px 40px rgba(26, 35, 126, 0.25);
          position: relative;
          overflow: hidden;
        }

        .help-card::before {
          content: '';
          position: absolute;
          top: -40px;
          right: -40px;
          width: 140px;
          height: 140px;
          background: rgba(245, 124, 0, 0.2);
          border-radius: 50%;
        }

        .help-title {
          color: #f57c00;
          font-weight: 800;
          font-size: 17px;
          margin: 0 0 12px 0;
          position: relative;
        }

        .help-text {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.7;
          margin: 0 0 18px 0;
          font-weight: 500;
          position: relative;
        }

        .help-phone {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          text-decoration: none;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.25s ease;
          position: relative;
        }

        .help-phone:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        /* ===== Responsive ===== */
        @media (max-width: 1024px) {
          .info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .form-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .contact-page {
            padding: 40px 16px;
          }
          .contact-title {
            font-size: 30px;
          }
          .contact-subtitle {
            font-size: 15px;
          }
          .info-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .form-card {
            padding: 24px 20px;
          }
          .form-title {
            font-size: 19px;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .contact-title {
            font-size: 26px;
          }
          .contact-subtitle {
            font-size: 14px;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
          .form-card {
            padding: 20px 16px;
          }
        }
      `}</style>
    </div>
  );
};

// ===== Info Card =====
const InfoCard = ({ icon, title, lines, color }) => (
  <div
    style={{
      background: '#fff',
      padding: '22px 18px',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      border: '1px solid #f0f0f0',
      borderTop: `4px solid ${color}`,
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 28px rgba(26, 35, 126, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
    }}
  >
    <div
      style={{
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        background: `${color}15`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        marginBottom: '14px',
      }}
    >
      {icon}
    </div>
    <h3
      style={{
        color: '#1a237e',
        fontWeight: 800,
        fontSize: '15px',
        margin: '0 0 10px 0',
      }}
    >
      {title}
    </h3>
    {lines.map((line, i) => (
      <p
        key={i}
        style={{
          color: '#666',
          fontSize: '12.5px',
          fontWeight: 500,
          lineHeight: 1.6,
          margin: '0 0 3px 0',
          wordBreak: 'break-word',
        }}
      >
        {line}
      </p>
    ))}
  </div>
);

// ===== Social Button =====
const SocialBtn = ({ icon, color }) => (
  <a
    href="#"
    style={{
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: `${color}15`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '17px',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = color;
      e.currentTarget.style.color = '#fff';
      e.currentTarget.style.transform = 'translateY(-3px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = `${color}15`;
      e.currentTarget.style.color = color;
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    {icon}
  </a>
);

export default Contact;