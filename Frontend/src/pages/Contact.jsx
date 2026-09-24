import React, { useState } from 'react';
import {
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock,
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin,
  FaPaperPlane
} from 'react-icons/fa';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.message) {
      setError('Please fill all required fields');
      return;
    }

    // TODO: Backend se connect karo baad me
    console.log('Contact form submitted:', form);
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div style={{ padding: '60px 20px', background: '#f9f9f9' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ===== Header ===== */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{
            color: '#1a237e',
            fontWeight: 800,
            fontSize: '42px',
            marginBottom: '15px',
            letterSpacing: '-0.5px'
          }}>
            Get in Touch
          </h1>
          <p style={{
            color: '#666',
            fontSize: '17px',
            fontWeight: 500,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.7
          }}>
            Have a question, feedback, or just want to say hi? We'd love to hear from you.
          </p>
        </div>

        {/* ===== Contact Info Cards ===== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <InfoCard
            icon={<FaMapMarkerAlt />}
            title="Visit Us"
            lines={['Yadav Shree Book Store', 'Main Road, Raipur', 'Chhattisgarh - 492001']}
            color="#1a237e"
          />
          <InfoCard
            icon={<FaPhone />}
            title="Call Us"
            lines={['+91 98765 43210', '+91 91234 56789', 'Mon-Sat, 10am-8pm']}
            color="#f57c00"
          />
          <InfoCard
            icon={<FaEnvelope />}
            title="Email Us"
            lines={['support@yadavshree.com', 'info@yadavshree.com', 'Reply within 24hrs']}
            color="#2e7d32"
          />
          <InfoCard
            icon={<FaClock />}
            title="Working Hours"
            lines={['Monday - Friday: 9am-9pm', 'Saturday: 10am-8pm', 'Sunday: Closed']}
            color="#c62828"
          />
        </div>

        {/* ===== Form + Info Layout ===== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '30px',
          alignItems: 'start'
        }}>

          {/* ===== Contact Form ===== */}
          <div style={{
            background: '#fff',
            padding: '35px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              color: '#1a237e',
              fontWeight: 800,
              fontSize: '22px',
              marginBottom: '25px'
            }}>
              Send us a Message
            </h2>

            {submitted && (
              <div style={{
                background: '#e8f5e9',
                color: '#2e7d32',
                padding: '14px',
                borderRadius: '6px',
                marginBottom: '20px',
                fontWeight: 700,
                fontSize: '14px',
                borderLeft: '4px solid #2e7d32'
              }}>
                ✅ Thank you! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div style={{
                background: '#ffebee',
                color: '#c62828',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '20px',
                fontWeight: 600,
                fontSize: '13px',
                borderLeft: '4px solid #c62828'
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  value={form.name}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email *"
                  value={form.email}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                style={inputStyle}
              />
              <textarea
                name="message"
                placeholder="Your Message *"
                rows="6"
                value={form.message}
                onChange={handleChange}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                required
              />
              <button
                type="submit"
                style={{
                  padding: '14px',
                  background: '#1a237e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  letterSpacing: '0.5px'
                }}
              >
                <FaPaperPlane /> Send Message
              </button>
            </form>
          </div>

          {/* ===== Right Side Info ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Follow Us */}
            <div style={{
              background: '#fff',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{
                color: '#1a237e',
                fontWeight: 800,
                fontSize: '18px',
                marginBottom: '20px'
              }}>
                Follow Us
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <SocialBtn icon={<FaFacebook />} color="#1877f2" />
                <SocialBtn icon={<FaTwitter />} color="#1da1f2" />
                <SocialBtn icon={<FaInstagram />} color="#e4405f" />
                <SocialBtn icon={<FaLinkedin />} color="#0077b5" />
              </div>
            </div>

            {/* FAQ Box */}
            <div style={{
              background: '#1a237e',
              padding: '30px',
              borderRadius: '12px',
              color: '#fff'
            }}>
              <h3 style={{
                fontWeight: 800,
                fontSize: '18px',
                marginBottom: '15px',
                color: '#f57c00'
              }}>
                Need Help Fast?
              </h3>
              <p style={{
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.7,
                marginBottom: '15px',
                color: '#c5cae9'
              }}>
                Check our FAQ section or chat with our support team. We're here 24/7.
              </p>
              <p style={{ fontSize: '14px', fontWeight: 700 }}>
                📞 +91 98765 43210
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

// ===== Info Card =====
const InfoCard = ({ icon, title, lines, color }) => (
  <div style={{
    background: '#fff',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    borderTop: `4px solid ${color}`
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: `${color}15`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      marginBottom: '15px'
    }}>
      {icon}
    </div>
    <h3 style={{
      color: '#1a237e',
      fontWeight: 800,
      fontSize: '16px',
      marginBottom: '12px'
    }}>
      {title}
    </h3>
    {lines.map((line, i) => (
      <p key={i} style={{
        color: '#666',
        fontSize: '13px',
        fontWeight: 500,
        lineHeight: 1.6,
        marginBottom: '3px'
      }}>
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
      width: '45px',
      height: '45px',
      borderRadius: '8px',
      background: `${color}15`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      textDecoration: 'none',
      transition: 'all 0.3s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = color;
      e.currentTarget.style.color = '#fff';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = `${color}15`;
      e.currentTarget.style.color = color;
    }}
  >
    {icon}
  </a>
);

// ===== Input Style =====
const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  border: '1.5px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  outline: 'none',
  fontFamily: 'inherit',
  background: '#fff',
};

export default Contact;