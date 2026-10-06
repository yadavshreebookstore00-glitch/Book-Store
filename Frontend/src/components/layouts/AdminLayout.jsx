import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaCalculator,
  FaFileInvoiceDollar,
  FaBook,
  FaImage,
  FaShoppingBag,
  FaUsers,
  FaEnvelope,
  FaSignOutAlt,
  FaBars,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadContacts, setUnreadContacts] = useState(0);

  // ===== Fetch unread contacts count =====
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data } = await api.get('/contacts?status=new&limit=1');
        setUnreadContacts(data.stats?.new || 0);
      } catch (err) {
        // Silent fail
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // ===== Lock body scroll when sidebar open (mobile) =====
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // ===== Auto-close sidebar on resize to desktop =====
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;

    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/admin/billing', icon: <FaCalculator />, label: 'Billing / POS' },
    { to: '/admin/sales', icon: <FaFileInvoiceDollar />, label: 'Sales History' },
    { to: '/admin/books', icon: <FaBook />, label: 'Add Books' },
    { to: '/admin/banners', icon: <FaImage />, label: 'Website Banners' },
    { to: '/admin/orders', icon: <FaShoppingBag />, label: 'Manage Orders' },
    { to: '/admin/users', icon: <FaUsers />, label: 'Registered Users' },
    {
      to: '/admin/contacts',
      icon: <FaEnvelope />,
      label: 'Contact Messages',
      badge: unreadContacts > 0 ? unreadContacts : null,
    },
  ];

  return (
    <div className={styles.wrapper}>
      {/* ===== Sidebar ===== */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}
      >
        <div className={styles.logoArea}>
          <h2>YADAV SHREE</h2>
          <p>Admin Panel</p>
        </div>

        <nav className={styles.navSection}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? `${styles.navItem} ${styles.active}`
                  : styles.navItem
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.badge && (
                <span className={styles.navBadge}>{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* ===== Overlay (mobile only) ===== */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* ===== Main Content ===== */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            <button
              className={styles.mobileToggle}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <FaBars />
            </button>
            <h3>Welcome, {user?.name || 'Admin'}</h3>
          </div>

          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div className={styles.adminName}>
                {user?.name || 'Admin'}
              </div>
              <div className={styles.adminRole}>Administrator</div>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;