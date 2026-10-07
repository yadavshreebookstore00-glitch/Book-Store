import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaSignInAlt,
  FaBox,
  FaHeart,
  FaCalendarAlt,
  FaShoppingBag,
  FaShoppingCart,
  FaCheckCircle,
  FaCrown,
  FaUserCircle,
  FaChevronRight,
  FaRupeeSign,
  FaBolt,
  FaIdCard,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import styles from './Profile.module.css';

// ===== Stat Card =====
const StatCard = ({ icon, label, value, tone, link }) => {
  const card = (
    <div className={`${styles.stat} ${styles[tone]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statText}>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className={styles.statLink}>
      {card}
    </Link>
  ) : (
    card
  );
};

// ===== Info Row =====
const InfoRow = ({ icon, label, value }) => (
  <div className={styles.infoRow}>
    <div className={styles.infoIcon}>{icon}</div>
    <div className={styles.infoBody}>
      <p className={styles.infoLabel}>{label}</p>
      <p className={styles.infoValue}>{value}</p>
    </div>
  </div>
);

// ===== Quick Action =====
const QuickAction = ({ icon, label, desc, to, color }) => (
  <Link to={to} className={styles.action} style={{ '--accent': color }}>
    <div className={styles.actionIcon}>{icon}</div>
    <div className={styles.actionBody}>
      <p className={styles.actionLabel}>{label}</p>
      <p className={styles.actionDesc}>{desc}</p>
    </div>
    <FaChevronRight className={styles.actionArrow} />
  </Link>
);

// ===== Profile Page =====
const Profile = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
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

  // Logout
  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) {
    return (
      <div className={styles.loginBox}>
        <h2>Please Login</h2>
        <Link to="/login" className={styles.loginBtn}>
          <FaSignInAlt /> Login
        </Link>
      </div>
    );
  }

  // Stats
  const totalSpent = orders
    .filter((o) => o.isPaid)
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

  // Initials
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const address = user.address?.street
    ? `${user.address.street}, ${user.address.city}, ${user.address.state} - ${user.address.pincode}`
    : 'Not set';

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div className={styles.page}>
      {/* ===== Header ===== */}
      <div className={styles.header}>
        <div className={styles.avatar}>{initials}</div>

        <div className={styles.headerInfo}>
          <h1 className={styles.name}>{user.name}</h1>

          <div className={styles.contacts}>
            {user.email && (
              <span>
                <FaEnvelope /> {user.email}
              </span>
            )}
            {user.phone && (
              <span>
                <FaPhone /> {user.phone}
              </span>
            )}
          </div>

          <div className={styles.role}>
            {user.role === 'admin' ? <FaCrown /> : <FaUserCircle />}
            {user.role === 'admin' ? 'Administrator' : 'Member'}
          </div>
        </div>
      </div>

      {/* ===== Stats ===== */}
      <div className={styles.stats}>
        <StatCard
          icon={<FaShoppingBag />}
          label="Total Orders"
          value={loading ? '...' : orders.length}
          tone="indigo"
          link="/orders"
        />
        <StatCard
          icon={<FaCheckCircle />}
          label="Delivered"
          value={loading ? '...' : deliveredOrders}
          tone="green"
        />
        <StatCard
          icon={<FaHeart />}
          label="Wishlist"
          value={wishlistCount}
          tone="red"
          link="/wishlist"
        />
        <StatCard
          icon={<FaShoppingCart />}
          label="In Cart"
          value={cartCount}
          tone="orange"
          link="/cart"
        />
      </div>

      {/* ===== Main Grid ===== */}
      <div className={styles.grid}>
        {/* Account Details */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <FaIdCard /> Account Details
          </h3>

          <InfoRow icon={<FaUser />} label="Full Name" value={user.name || 'Not set'} />
          <InfoRow icon={<FaEnvelope />} label="Email" value={user.email || 'Not set'} />
          <InfoRow icon={<FaPhone />} label="Phone" value={user.phone || 'Not set'} />
          <InfoRow icon={<FaMapMarkerAlt />} label="Address" value={address} />
          <InfoRow icon={<FaCalendarAlt />} label="Member Since" value={memberSince} />
        </div>

        {/* Quick Actions */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <FaBolt /> Quick Actions
          </h3>

          <div className={styles.actions}>
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
              desc={`${wishlistCount} items saved`}
              to="/wishlist"
              color="#c62828"
            />
            <QuickAction
              icon={<FaShoppingCart />}
              label="Shopping Cart"
              desc={`${cartCount} items in cart`}
              to="/cart"
              color="#f57c00"
            />
          </div>

          {orders.length > 0 && (
            <div className={styles.spent}>
              <FaRupeeSign className={styles.spentIcon} />
              <div>
                <p className={styles.spentLabel}>TOTAL SPENT</p>
                <p className={styles.spentValue}>
                  ₹{totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          )}

          <button type="button" onClick={handleLogout} className={styles.logout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;