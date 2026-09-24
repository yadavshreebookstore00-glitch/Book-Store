import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaCalculator,
  FaFileInvoiceDollar,
  FaBook,
  FaImage,
  FaShoppingBag,
  FaUsers,
  FaSignOutAlt,
  FaBars,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;

    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    {
      to: '/admin/dashboard',
      icon: <FaTachometerAlt />,
      label: 'Dashboard',
    },
    {
      to: '/admin/billing',
      icon: <FaCalculator />,
      label: 'Billing / POS',
    },
    {
      to: '/admin/sales',
      icon: <FaFileInvoiceDollar />,
      label: 'Sales History',
    },
    {
      to: '/admin/books',
      icon: <FaBook />,
      label: 'Manage Books',
    },
    {
      to: '/admin/banners',
      icon: <FaImage />,
      label: 'Manage Banners',
    },
    {
      to: '/admin/orders',
      icon: <FaShoppingBag />,
      label: 'Manage Orders',
    },
    {
      to: '/admin/users',
      icon: <FaUsers />,
      label: 'Manage Users',
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
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* ===== Main Content ===== */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              className={styles.mobileToggle}
              onClick={() => setSidebarOpen(!sidebarOpen)}
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