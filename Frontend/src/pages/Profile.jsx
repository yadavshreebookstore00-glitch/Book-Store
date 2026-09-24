import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaBox,
  FaHeart,
  FaCalendarAlt,
  FaShoppingBag,
  FaCheckCircle,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== Fetch user's orders =====
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Orders fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // ===== Logout =====
  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;

    logout();
    navigate('/login', { replace: true });
  };

  if (!user) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#1a237e', marginBottom: '15px' }}>Please Login</h2>
        <Link
          to="/login"
          style={{
            background: '#1a237e',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          Login
        </Link>
      </div>
    );
  }

  // ===== Stats =====
  const totalSpent = orders
    .filter((o) => o.isPaid)
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const deliveredOrders = orders.filter(
    (o) => o.status === 'Delivered'
  ).length;

  // ===== Initials =====
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div style={{ padding: '30px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* ===== Header Card ===== */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
          borderRadius: '16px',
          padding: 'clamp(25px, 4vw, 40px)',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '25px',
          flexWrap: 'wrap',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        {/* Avatar */}
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: '#f57c00',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: 800,
            flexShrink: 0,
            border: '4px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          }}
        >
          {initials}
        </div>

        {/* User Info */}
        <div
          style={{
            flex: 1,
            minWidth: '200px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontWeight: 800,
              fontSize: 'clamp(22px, 3vw, 28px)',
              marginBottom: '5px',
              margin: 0,
            }}
          >
            {user.name}
          </h1>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '15px',
              fontSize: '13px',
              fontWeight: 500,
              opacity: 0.9,
              marginTop: '10px',
            }}
          >
            {user.email && (
              <span
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaEnvelope /> {user.email}
              </span>
            )}
            {user.phone && (
              <span
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaPhone /> {user.phone}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              marginTop: '12px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            {user.role === 'admin' ? '👑 Administrator' : '👤 Member'}
          </div>
        </div>
      </div>

      {/* ===== Stats Cards ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '15px',
          marginBottom: '25px',
        }}
      >
        <StatCard
          icon={<FaShoppingBag />}
          label="Total Orders"
          value={loading ? '...' : orders.length}
          color="#1a237e"
          bg="#e8eaf6"
          link="/orders"
        />
        <StatCard
          icon={<FaCheckCircle />}
          label="Delivered"
          value={loading ? '...' : deliveredOrders}
          color="#2e7d32"
          bg="#e8f5e9"
        />
        <StatCard
          icon={<FaHeart />}
          label="Wishlist"
          value={wishlistCount}
          color="#c62828"
          bg="#ffebee"
          link="/wishlist"
        />
        <StatCard
          icon={<FaBox />}
          label="In Cart"
          value={cartCount}
          color="#f57c00"
          bg="#fff3e0"
          link="/cart"
        />
      </div>

      {/* ===== Main Content Grid ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {/* ===== Account Details ===== */}
        <div
          style={{
            background: '#fff',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          }}
        >
          <h3
            style={{
              color: '#1a237e',
              fontWeight: 800,
              fontSize: '17px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FaUser /> Account Details
          </h3>

          <InfoRow
            icon={<FaUser />}
            label="Full Name"
            value={user.name || 'Not set'}
          />
          <InfoRow
            icon={<FaEnvelope />}
            label="Email"
            value={user.email || 'Not set'}
          />
          <InfoRow
            icon={<FaPhone />}
            label="Phone"
            value={user.phone || 'Not set'}
          />
          <InfoRow
            icon={<FaMapMarkerAlt />}
            label="Address"
            value={
              user.address?.street
                ? `${user.address.street}, ${user.address.city}, ${user.address.state} - ${user.address.pincode}`
                : 'Not set'
            }
          />
          <InfoRow
            icon={<FaCalendarAlt />}
            label="Member Since"
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'N/A'
            }
          />
        </div>

        {/* ===== Quick Actions ===== */}
        <div
          style={{
            background: '#fff',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            height: 'fit-content',
          }}
        >
          <h3
            style={{
              color: '#1a237e',
              fontWeight: 800,
              fontSize: '17px',
              marginBottom: '20px',
            }}
          >
            ⚡ Quick Actions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <QuickAction
              icon={<FaBox />}
              label="My Orders"
              desc={`${orders.length} orders placed`}
              to="/orders"
              color="#1a237e"
            />
            <QuickAction
              icon={<FaHeart />}
              label="My Wishlist"
              desc={`${wishlistCount} books saved`}
              to="/wishlist"
              color="#c62828"
            />
            <QuickAction
              icon={<FaShoppingBag />}
              label="Shopping Cart"
              desc={`${cartCount} items in cart`}
              to="/cart"
              color="#f57c00"
            />
          </div>

          {/* Total Spent */}
          {orders.length > 0 && (
            <div
              style={{
                background: '#e8f5e9',
                padding: '15px',
                borderRadius: '10px',
                marginTop: '20px',
                borderLeft: '4px solid #2e7d32',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  color: '#666',
                  fontWeight: 600,
                  marginBottom: '3px',
                }}
              >
                TOTAL SPENT
              </p>
              <p
                style={{
                  fontSize: '22px',
                  color: '#2e7d32',
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                ₹{totalSpent.toLocaleString('en-IN')}
              </p>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              marginTop: '20px',
              background: '#ffebee',
              color: '#c62828',
              border: '2px solid #c62828',
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#c62828';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffebee';
              e.currentTarget.style.color = '#c62828';
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Stat Card Component =====
const StatCard = ({ icon, label, value, color, bg, link }) => {
  const content = (
    <div
      style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.3s',
        cursor: link ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (link) e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        if (link) e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          width: '45px',
          height: '45px',
          borderRadius: '10px',
          background: bg,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: '12px',
            color: '#666',
            fontWeight: 600,
            margin: 0,
            marginBottom: '3px',
          }}
        >
          {label}
        </p>
        <h3
          style={{
            fontSize: '22px',
            color: color,
            fontWeight: 800,
            margin: 0,
          }}
        >
          {value}
        </h3>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  ) : (
    content
  );
};

// ===== Info Row =====
const InfoRow = ({ icon, label, value }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0',
    }}
  >
    <div
      style={{
        width: '35px',
        height: '35px',
        borderRadius: '8px',
        background: '#f5f5f5',
        color: '#1a237e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontSize: '11px',
          color: '#999',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: 0,
          marginBottom: '3px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '14px',
          color: '#333',
          fontWeight: 600,
          margin: 0,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

// ===== Quick Action =====
const QuickAction = ({ icon, label, desc, to, color }) => (
  <Link
    to={to}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px',
      background: '#f9f9f9',
      borderRadius: '10px',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.2s',
      border: '1px solid transparent',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#fff';
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.transform = 'translateX(5px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#f9f9f9';
      e.currentTarget.style.borderColor = 'transparent';
      e.currentTarget.style.transform = 'translateX(0)';
    }}
  >
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: `${color}15`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#1a237e',
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '12px',
          color: '#666',
          fontWeight: 500,
          margin: 0,
        }}
      >
        {desc}
      </p>
    </div>
    <span style={{ color: color, fontWeight: 800 }}>→</span>
  </Link>
);

export default Profile;